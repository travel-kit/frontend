"use client"

import { useState, useEffect } from "react"
import { Search, Globe, MessageSquare, ThumbsUp, Eye, Plus } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { db, auth } from "@/lib/firebase"
import { ref, onValue, push, update, serverTimestamp, get } from 'firebase/database'
import { useUser } from "@/contexts/UserContext"
import type { Post } from "@/types/community"
import { useRouter } from "next/navigation"
import { COUNTRIES, COUNTRY_FLAGS } from "@/lib/constants"

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

export default function CommunityClientPage() {
  const [selectedCountry, setSelectedCountry] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [posts, setPosts] = useState<Post[]>([])
  const [isNewPostDialogOpen, setIsNewPostDialogOpen] = useState(false)
  const [newPost, setNewPost] = useState({ title: "", content: "", country: "" })
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()
  const { user } = useUser()
  const router = useRouter()

  // 기본 국가 목록
  const defaultCountries = ["일본", "중국", "태국", "베트남", "프랑스", "영국", "미국", "호주"]

  // 게시글 불러오기
  useEffect(() => {
    console.log("Fetching posts from Firebase...")
    const postsRef = ref(db, 'posts')
    
    const unsubscribe = onValue(postsRef, (snapshot) => {
      if (snapshot.exists()) {
        const postsData = Object.entries(snapshot.val() || {}).map(([id, data]: [string, any]) => ({
          id,
          ...data,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
          likes: data.likes ? Object.values(data.likes) : [],
          comments: data.comments ? Object.values(data.comments) : []
        })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        
        console.log("Processed posts:", postsData)
        setPosts(postsData)
      } else {
        console.log("No posts found")
        setPosts([])
      }
    }, (error) => {
      console.error("Error fetching posts:", error)
      toast({
        title: "데이터 로드 오류",
        description: "게시글을 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    })

    return () => {
      unsubscribe()
    }
  }, [toast])

  // 게시글 작성
  const handleCreatePost = async () => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "게시글을 작성하려면 먼저 로그인해주세요.",
        variant: "destructive",
      })
      return
    }

    if (!newPost.title || !newPost.content || !newPost.country) {
      toast({
        title: "입력 오류",
        description: "제목, 내용, 국가를 모두 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    try {
      const postsRef = ref(db, 'posts')
      const newPostRef = push(postsRef)
      
      const postData = {
        ...newPost,
        author: {
          id: user.uid,
          name: user.displayName || "익명",
          email: user.email,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: {},
        comments: {},
        views: 0,
      }

      console.log("Creating new post with data:", postData)
      
      await update(newPostRef, postData)
      console.log("Post successfully created with ID:", newPostRef.key)

      setNewPost({ title: "", content: "", country: "" })
      setIsNewPostDialogOpen(false)
      toast({
        title: "게시글 작성 완료",
        description: "게시글이 성공적으로 작성되었습니다.",
      })
    } catch (error) {
      console.error("Error creating post:", error)
      toast({
        title: "오류 발생",
        description: "게시글 작성 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 좋아요 토글
  const handleToggleLike = async (postId: string) => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "좋아요를 누르려면 먼저 로그인해주세요.",
        variant: "destructive",
      })
      return
    }

    try {
      const postRef = ref(db, `posts/${postId}/likes/${user.uid}`)
      const snapshot = await get(postRef)
      
      if (snapshot.exists()) {
        await update(ref(db, `posts/${postId}/likes`), {
          [user.uid]: null
        })
      } else {
        await update(ref(db, `posts/${postId}/likes`), {
          [user.uid]: true
        })
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

  // 조회수 증가
  const handleIncreaseView = async (postId: string) => {
    try {
      const postRef = ref(db, `posts/${postId}`)
      const snapshot = await get(postRef)
      
      if (snapshot.exists()) {
        const currentViews = snapshot.val().views || 0
        await update(postRef, {
          views: currentViews + 1
        })
      }
    } catch (error) {
      console.error("Error increasing view count:", error)
    }
  }

  // 게시글 필터링
  const getFilteredPosts = () => {
    let filtered = posts.filter(
    (post) =>
      (selectedCountry === "all" || post.country === selectedCountry) &&
      (post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    switch (activeTab) {
      case "popular": {
        // 3일 전 날짜 계산
        const threeDaysAgo = new Date()
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

        // 최근 3일 동안의 게시글 중 좋아요가 있는 게시글만 필터링
        return filtered
          .filter(post => {
            return post.createdAt >= threeDaysAgo && post.likes.length > 0
          })
          // 좋아요 수와 조회수를 기준으로 정렬 (좋아요 * 2 + 조회수)
          .sort((a, b) => {
            const scoreA = (a.likes.length * 2) + (a.views || 0)
            const scoreB = (b.likes.length * 2) + (b.views || 0)
            return scoreB - scoreA
          })
          // 상위 10개만 선택
          .slice(0, 10)
      }
      default:
        return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }
  }

  // 국가 목록 (기본 국가 목록과 게시글의 국가 목록 합치기)
  const countries = Array.from(new Set([...defaultCountries, ...posts.map((post) => post.country)]))

  return (
    <div className="container mx-auto px-4 pt-2 pb-6 min-h-screen">
      <div className="flex flex-col md:flex-row gap-4 mb-6 mt-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="검색어를 입력하세요"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-[180px]">
            <Globe className="w-4 h-4 mr-2" />
            <SelectValue placeholder="국가 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">🌏 전체</SelectItem>
            {COUNTRIES.map((country) => (
              <SelectItem key={country.name} value={country.name}>
                {country.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={isNewPostDialogOpen} onOpenChange={setIsNewPostDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              글쓰기
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">새 게시글 작성</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">제목</label>
                <Input
                  id="title"
                  placeholder="제목을 입력하세요"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="country" className="text-sm font-medium">국가</label>
                <Select value={newPost.country} onValueChange={(value) => setNewPost({ ...newPost, country: value })}>
                  <SelectTrigger id="country" className="border-gray-300">
                    <SelectValue placeholder="국가 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.name} value={country.name}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">내용</label>
                <Textarea
                  id="content"
                  placeholder="내용을 입력하세요"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="min-h-[200px] border-gray-300"
                />
              </div>
              <Button onClick={handleCreatePost} className="w-full">
                작성 완료
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50">
          <TabsTrigger 
            value="all"
            className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-medium"
          >
            전체 글
          </TabsTrigger>
          <TabsTrigger 
            value="popular"
            className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-medium"
          >
            인기 글
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-4">
        {getFilteredPosts().map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardContent 
              className="pt-6 cursor-pointer"
              onClick={() => {
                handleIncreaseView(post.id)
                router.push(`/community/${post.id}`)
              }}
            >
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="text-sm">
                    {COUNTRY_FLAGS[post.country]} {post.country}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {formatDate(post.createdAt)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{post.content}</p>
                  <div className="text-sm text-gray-500">
                    <span>{post.author.name}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t pt-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleLike(post.id)
                  }}
                >
                  <ThumbsUp className={`w-4 h-4 mr-1 ${post.likes.includes(user?.uid || "") ? "fill-current" : ""}`} />
                  <span>{post.likes.length}</span>
                </Button>
                    <div className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  <span>{post.comments.length}</span>
                    </div>
                    <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  <span>{post.views}</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
      </div>
    </div>
  )
}
