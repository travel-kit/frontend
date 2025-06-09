"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, Eye, ArrowLeft, MessageSquare, Trash2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { ref, update, get, remove } from "firebase/database"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/contexts/UserContext"
import type { Post } from "@/types/community"
import { Comments } from "@/components/comments"
import { COUNTRY_FLAGS } from "@/lib/constants"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PostDetailClientPageProps {
  post: Post
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date)
}

export default function PostDetailClientPage({ post }: PostDetailClientPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useUser()
  const [currentPost, setCurrentPost] = useState(post)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleToggleLike = async () => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "좋아요를 누르려면 먼저 로그인해주세요.",
        variant: "destructive",
      })
      return
    }

    try {
      const postRef = ref(db, `posts/${post.id}/likes/${user.uid}`)
      const snapshot = await get(postRef)
      
      if (snapshot.exists()) {
        await update(ref(db, `posts/${post.id}/likes`), {
          [user.uid]: null
        })
        setCurrentPost(prev => ({
          ...prev,
          likes: prev.likes.filter(id => id !== user.uid)
        }))
      } else {
        await update(ref(db, `posts/${post.id}/likes`), {
          [user.uid]: true
        })
        setCurrentPost(prev => ({
          ...prev,
          likes: [...prev.likes, user.uid]
        }))
      }
    } catch (error) {
      console.error("Error toggling like:", error)
      toast({
        title: "오류 발생",
        description: "좋아요 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleDeletePost = async () => {
    if (!user || user.uid !== currentPost.author.id) {
      toast({
        title: "권한 없음",
        description: "자신이 작성한 게시글만 삭제할 수 있습니다.",
        variant: "destructive",
      })
      return
    }

    try {
      const postRef = ref(db, `posts/${currentPost.id}`)
      await remove(postRef)
      
      toast({
        title: "게시글 삭제 완료",
        description: "게시글이 성공적으로 삭제되었습니다.",
      })
      router.push("/community")
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: "오류 발생",
        description: "게시글 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const isAuthor = user?.uid === currentPost.author.id

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>
        {isAuthor && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            삭제
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <Badge variant="secondary" className="text-sm">
                {COUNTRY_FLAGS[currentPost.country]} {currentPost.country}
              </Badge>
              <span className="text-sm text-gray-500">
                {formatDate(currentPost.createdAt)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">{currentPost.title}</h1>
              <div className="text-sm text-gray-500 mb-4">
                <span>{currentPost.author.name}</span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{currentPost.content}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t pt-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center"
              onClick={handleToggleLike}
            >
              <ThumbsUp className={`w-4 h-4 mr-1 ${currentPost.likes.includes(user?.uid || "") ? "fill-current" : ""}`} />
              <span>{currentPost.likes.length}</span>
            </Button>
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-1" />
              <span>{currentPost.comments.length}</span>
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              <span>{currentPost.views}</span>
            </div>
          </div>
        </CardFooter>
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">댓글</h2>
        <Comments postId={currentPost.id} comments={currentPost.comments} />
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>게시글 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-red-600 hover:bg-red-700">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 