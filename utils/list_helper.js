const dummy = (blogs) => {
    return 1
}


const totalLikes = (blogs) => {
    let total = 0
    for (let i = 0; i < blogs.length; i++) {
        total += blogs[i].likes
    }
  
    return blogs.length === 0
        ? 0
        : total
}


const favouriteBlog = (blogs) => {
    let most = 0
    let index = 0
    for (let i = 0; i < blogs.length; i++) {
        if (blogs[i].likes > most) {
            most = blogs[i].likes
            index = i
        }
    }
    return blogs.length === 0
        ? 0
        : blogs[index]
}


const mostBlogs = (blogs) => {
    const counter = blogs.reduce((counts, blog) => {
        if (counts[blog.author]) {
            counts[blog.author]++
        } else {
            counts[blog.author] = 1
        }
        return counts
    }, {})

    let most = 0
    let authorWithMost = ""
    for (let author in counter) {
        if (counter[author] > most) {
            most = counter[author]
            authorWithMost = author
        }
    }

    return { author: authorWithMost, blogs: most }
}


const mostLikes = (blogs) => {
    const authorLikes = blogs.reduce((accumulator, blog) => {
        if (!accumulator[blog.author]) {
            accumulator[blog.author] = 0
        }
        accumulator[blog.author] += blog.likes
        return accumulator
    }, {})

    let most = 0
    let mostLiked = ""
    for (let author in authorLikes) {
        if (authorLikes[author] > most) {
            most = authorLikes[author]
            mostLiked = author
        }
    }

    return { author: mostLiked, likes: most }
}


module.exports = {
    dummy, totalLikes, favouriteBlog, mostBlogs, mostLikes
}

