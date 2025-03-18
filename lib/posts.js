import { supabase } from './supabase'

// 获取所有文章
export async function getAllPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      published,
      created_at,
      users (
        name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// 获取单篇文章
export async function getPostById(id) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      published,
      created_at,
      users (
        name,
        avatar_url
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

// 创建文章
export async function createPost({ title, content, authorId }) {
  const { data, error } = await supabase
    .from('posts')
    .insert([
      { title, content, author_id: authorId }
    ])
    .select()
  
  if (error) throw error
  return data[0]
}

// 更新文章
export async function updatePost(id, updates) {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

// 删除文章
export async function deletePost(id) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
} 