import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function RealtimePosts({ serverPosts }) {
  const [posts, setPosts] = useState(serverPosts)

  useEffect(() => {
    const subscription = supabase
      .from('posts')
      .on('INSERT', payload => {
        setPosts(previous => [payload.new, ...previous])
      })
      .on('UPDATE', payload => {
        setPosts(previous => 
          previous.map(post => post.id === payload.new.id ? payload.new : post)
        )
      })
      .on('DELETE', payload => {
        setPosts(previous => 
          previous.filter(post => post.id !== payload.old.id)
        )
      })
      .subscribe()

    return () => {
      supabase.removeSubscription(subscription)
    }
  }, [])

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content.substring(0, 100)}...</p>
        </div>
      ))}
    </div>
  )
} 