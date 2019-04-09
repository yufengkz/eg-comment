const KoaRouter = require('koa-router')

const Models = require('../models')

const router = new KoaRouter()

router.post('/Contents', async ctx => {
    let page = Number(ctx.request.body.page) || 1  //当前第几页
    let pageSize = Number(ctx.request.body.pageSize) || 2  //每页显示多少条
    let offset = (page - 1) * pageSize  //偏移量

    let data = await Models.Contents.findAndCountAll({
        offset: offset,
        limit: pageSize, //每页显示多少条
        include: {
            model: Models.Users
        }
    })
    
    let res = data.rows.map(d => {
        return {
            id: d.id,
            title: d.title,
            content: d.content,
            user_id: d.user_id,
            username: d.User.username,
            created_at: d.createdAt,
            like_count: d.like_count,
            comment_count: d.comment_count
        }
    })

    ctx.body = {
        code: 0,
        count: data.count,
        pageSize,
        data: res
    }
})

module.exports = router