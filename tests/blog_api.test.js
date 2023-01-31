const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const app = require('../app')
const testHelper = require('./test_helper')
const api = supertest(app)

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})


test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(response.body.length)
})


test('the field __id is called id instead', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id.toBeDefined)
})


test('a blog can be added', async () => {
    const newBlog = {
        title: 'new',
        author: 'blog',
        url: 'added',
        likes: 1
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const allBlogs = await testHelper.blogsInDb()
    const response = await api.get('/api/blogs')
    expect(allBlogs).toHaveLength(response.body.length)
})


test('a blog without likes will be given 0', async () => {
    const newBlog = {
        title: 'blog',
        author: 'without',
        url: 'likes'
    }

    await api.post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    expect(response.body[response.body.length - 1].likes).toEqual(0)
})


test('a blog without title and url is not added', async () => {
    const newBlog = {
        author: 'not a valid blog',
        likes: 10
    }

    const response = await api.get('/api/blogs')

    await api.post('/api/blogs')
        .send(newBlog)
        .expect(400)

    const allBlogs = await testHelper.blogsInDb()
    expect(response.body.length).toEqual(allBlogs.length)
})


test('a blog can be deleted', async () => {
    const blogsAtStart = await testHelper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
  
    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)
    const blogsAtEnd = await testHelper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length -1)
})

test('likes can be updated', async () => {
    const blogsAtStart = await testHelper.blogsInDb()
    const likesAtStart = blogsAtStart[0].likes
    const blogToUpdate = blogsAtStart[0]
    const updatedLikes = blogToUpdate.likes + 1
    await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send({ likes: updatedLikes })
        .expect(200)

    const blogsAtEnd = await testHelper.blogsInDb()
    const likesAtEnd = blogsAtEnd[0].likes
    expect(likesAtEnd).toEqual(likesAtStart + 1)

})


describe('when there is initially one user at db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await testHelper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('expected `username` to be unique')

        const usersAtEnd = await testHelper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })


    test('creation fails with proper statuscode and message if username is missing', async () => {
        const usersAtStart = await testHelper.usersInDb()

        const invalidUser = {
            name: 'Teemu',
            password: 'aaaaaa'
        }

        const result = await api
            .post('/api/users')
            .send(invalidUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('`username` is required')

        const usersAtEnd = await testHelper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })


    test('creation fails with proper statuscode and message if the username is too short', async () => {
        const usersAtStart = await testHelper.usersInDb()

        const invalidUser = {
            username: 'a',
            name: 'Teemu',
            password: 'sala'
        }

        const result = await api
            .post('/api/users')
            .send(invalidUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('shorter than the minimum')

        const usersAtEnd = await testHelper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })


    test('creation fails with proper statuscode and message if the password is too short', async () => {
        const usersAtStart = await testHelper.usersInDb()

        const invalidUser = {
            username: 'aaaaaa',
            name: 'Teemu',
            password: 's'
        }

        const result = await api
            .post('/api/users')
            .send(invalidUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('password is too short')

        const usersAtEnd = await testHelper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })


    test('creation fails with proper statuscode and message if the password is missing', async () => {
        const usersAtStart = await testHelper.usersInDb()

        const invalidUser = {
            username: 'aaaaaa',
            name: 'Teemu'
        }

        const result = await api
            .post('/api/users')
            .send(invalidUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('password missing')

        const usersAtEnd = await testHelper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })


    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await testHelper.usersInDb()

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await testHelper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })
})


afterAll(() => {
    mongoose.connection.close()
})