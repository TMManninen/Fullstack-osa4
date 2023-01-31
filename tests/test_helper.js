const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
    {
        title: 'Blogi',
        author: 'Teemu',
        url: 'joku',
        likes: 0
    },
    {
        title: 'Toinen',
        author: 'Manninen',
        url: 'jokumuu',
        likes: 1
    }
]


const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}


const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}


module.exports = {
    initialBlogs, blogsInDb, usersInDb
}