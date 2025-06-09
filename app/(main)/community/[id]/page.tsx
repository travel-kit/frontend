"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { ref, get } from "firebase/database"
import { useToast } from "@/components/ui/use-toast"
import type { Post } from "@/types/community"
import PostDetailClientPage from "./PostDetailClientPage"

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      if (!params.id) {
        router.push("/community")
        return
      }

      try {
        const postRef = ref(db, `posts/${params.id}`)
        const snapshot = await get(postRef)

        if (!snapshot.exists()) {
          toast({
            title: "게시글을 찾을 수 없습니다",
            description: "요청하신 게시글이 존재하지 않습니다.",
            variant: "destructive",
          })
          router.push("/community")
          return
        }

        const postData = {
          id: params.id as string,
          ...snapshot.val(),
          createdAt: new Date(snapshot.val().createdAt),
          updatedAt: new Date(snapshot.val().updatedAt),
          likes: snapshot.val().likes ? Object.values(snapshot.val().likes) : [],
          comments: snapshot.val().comments ? 
            Object.entries(snapshot.val().comments).map(([key, comment]: [string, any]) => ({
              ...comment,
              key,
              createdAt: new Date(comment.createdAt)
            })) : []
        }

        setPost(postData)
      } catch (error) {
        console.error("Error fetching post:", error)
        toast({
          title: "오류 발생",
          description: "게시글을 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        })
        router.push("/community")
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.id, router, toast])

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>
  }

  if (!post) {
    return null
  }

  return <PostDetailClientPage post={post} />
} 