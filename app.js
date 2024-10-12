const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

// 根路径路由，提供主页
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');  // 确保index.html在public文件夹内
});
// 登录
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // 查询用户信息
    const sql = `SELECT * FROM users WHERE username = ?`;
    db.query(sql, [username], (err, result) => {
        if (err) throw err;
        
        if (result.length > 0) {
            const user = result[0];
            
            // 校验密码
            if (user.password === password) {
                res.status(200).json({ userId: user.user_id, role: user.role });
            } else {
                // 密码错误
                res.status(401).json({ message: '密码错误' });
            }
        } else {
            // 用户名不存在
            res.status(401).json({ message: '用户名不存在' });
        }
    });
});



// 创建任务 (admin)
app.post('/task', (req, res) => {
    const { taskName } = req.body;
    const sql = `INSERT INTO tasks (task_name) VALUES (?)`;
    db.query(sql, [taskName], (err, result) => {
        if (err) throw err;
        res.status(201).json({ message: '任务发布成功' });
    });
});

// 获取最后一次任务的签到状态 (admin)
app.get('/admin/attendance', (req, res) => {
    // 查询最后一个任务的ID
    const getLastTaskId = `SELECT MAX(task_id) AS last_task_id FROM tasks`;
    const getLastTasktime = `SELECT MAX(created_at AS last_task_time FROM tasks`;

    db.query(getLastTaskId, (err, taskResult) => {
        if (err) throw err;
        const lastTaskId = taskResult[0].last_task_id;
        const lastTasktime = taskResult[0].last_task_time;
        if (!lastTaskId) {
            return res.status(404).json({ message: '没有找到任务' });
        }

        // 获取所有用户和他们的签到状态
        const sql = `
            SELECT u.username, 
                   IFNULL(a.status, '4') AS status 
            FROM users u
            LEFT JOIN attendance a ON u.user_id = a.user_id AND a.task_id = ?
        `;
        db.query(sql, [lastTaskId], (err, result) => {
            if (err) throw err;
            res.status(200).json(result);
        });
    });
});


// 提交签到状态 (student)
app.post('/student/attendance', (req, res) => {
    const { userId, taskId, status } = req.body;
    
    if (!userId) {
        return res.status(400).json({ message: 'userId 不能为空' });
    }
    
    const sql = `INSERT INTO attendance (task_id, user_id, status) 
                 VALUES (?, ?, ?) 
                 ON DUPLICATE KEY UPDATE status = ?`;
    db.query(sql, [taskId, userId, status, status], (err, result) => {
        if (err) throw err;
        res.status(201).json({ message: '签到状态提交成功' });
    });
});


// 获取最后一次任务 (student)
app.get('/student/last-task', (req, res) => {
    const sql = `SELECT * FROM tasks ORDER BY task_id DESC LIMIT 1`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.status(200).json(result[0]);
    });
});

app.listen(80, () => {
    console.log('Server started on port 80');
});
