"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { ref, push, serverTimestamp, onValue, off, remove, update } from "firebase/database"
import { useUser } from "@/contexts/UserContext"
import { Trash2 } from "lucide-react"
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

interface Comment {
  id: string
  key?: string
  content: string
  author: {
    id: string
    name: string
    email: string
  }
  createdAt: Date
}

interface CommentsProps {
  postId: string
  comments: Comment[]
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

export function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useUser()

  useEffect(() => {
    const commentsRef = ref(db, `posts/${postId}/comments`)
    
    const unsubscribe = onValue(commentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const commentsData = Object.entries(snapshot.val()).map(([key, data]: [string, any]) => ({
          ...data,
          id: key,
          key: key,
          createdAt: new Date(data.createdAt)
        })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        
        setComments(commentsData)
      } else {
        setComments([])
      }
    })

    return () => {
      off(commentsRef)
    }
  }, [postId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "댓글을 작성하려면 먼저 로그인해주세요.",
        variant: "destructive",
      })
      return
    }

    if (!newComment.trim()) {
      toast({
        title: "입력 오류",
        description: "댓글 내용을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    try {
      const commentsRef = ref(db, `posts/${postId}/comments`)
      const newCommentRef = push(commentsRef)
      
      await update(ref(db, `posts/${postId}/comments/${newCommentRef.key}`), {
        content: newComment,
        author: {
          id: user.uid,
          name: user.displayName || "익명",
          email: user.email,
        },
        createdAt: serverTimestamp(),
      })

      setNewComment("")
      toast({
        title: "댓글 작성 완료",
        description: "댓글이 성공적으로 작성되었습니다.",
      })
    } catch (error) {
      console.error("Error creating comment:", error)
      toast({
        title: "오류 발생",
        description: "댓글 작성 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (commentId: string) => {
    setSelectedCommentId(commentId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteComment = async () => {
    if (!selectedCommentId || !user) return

    const comment = comments.find(c => c.id === selectedCommentId)
    if (!comment || comment.author.id !== user.uid) {
      toast({
        title: "권한 없음",
        description: "자신이 작성한 댓글만 삭제할 수 있습니다.",
        variant: "destructive",
      })
      return
    }

    try {
      const commentRef = ref(db, `posts/${postId}/comments/${selectedCommentId}`)
      await remove(commentRef)
      
      toast({
        title: "댓글 삭제 완료",
        description: "댓글이 성공적으로 삭제되었습니다.",
      })
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast({
        title: "오류 발생",
        description: "댓글 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="댓글을 입력하세요"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button type="submit">댓글 작성</Button>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-gray-50 p-4 rounded-lg space-y-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{comment.author.name}</span>
                  <span className="text-sm text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="mt-2">{comment.content}</p>
              </div>
              {user?.uid === comment.author.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteClick(comment.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>댓글 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 댓글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComment} className="bg-red-600 hover:bg-red-700">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 