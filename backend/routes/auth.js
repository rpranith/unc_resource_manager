const router = require('express').Router();
const User = require('../models/User');
const Post = require('../models/Post');
const bcrypt = require('bcrypt');

router.post('/register', async (req, res) => {
    // check if user exists
    const emailExists = await User.findOne({email: req.body.email});
    if(emailExists) return res.status(400).send('Email already exists');

     // hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword,
        pid: req.body.pid
    });

    user.save().then(data => {
        res.json({success: true, user: data});
    }).catch(err => {
        res.json({success: false, user: null});
    });
});

router.post('/login', async (req, res) => {

    // check if email exists
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send({success: false, message:'Email does not exist'});

    // password
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) return res.status(400).send({success: false, message: 'Invalid Password'});

    req.session.user = user;

    res.send({success: true, user: user}).status(200);


});

router.get('/logged-in', (req, res) => {
    req.session.user ? res.status(200).send(true) : res.send(false);
})

router.get('/logout', (req, res) => {
    delete req.session.user;
    res.send({success: true, message: "Logged out!"});
});

router.get('/curr-user', (req, res) => {
    if(req.session.user) {
        let currUser = {
            name: req.session.user.name,
            id: req.session.user._id,
            email: req.session.user.email,
            pid: req.session.user.pid,
            bookmarkedTips: req.session.user.bookmarkedTips
        }
        res.send(currUser).status(200);
        return;
    } else {
        res.send('Unauthorized!').status(400);
    }
});

router.put('/:id', async (req, res) => {
    if(!req.session.user) {
        res.send('Unauthorized!');
        return;
    }
    const user = await User.findOne({_id: req.params.id});

    user.name = req.body.name;
    user.email = req.body.email;
    user.pid = req.body.pid;

    await user.save().then((data) => {
        req.session.user = data;
        res.send({success: true, message: "success!"});
        return;
    }).catch((err) => {
        res.send({success: false, error: err});
        return;
    });
});

router.post('/bookmark/:id', async (req, res) => {
    if(!req.session.user) {
        res.send('Unauthorized!');
        return;
    }

    const post = await Post.findOne({_id: req.params.id});
    const user = await User.findOne({_id: req.body.id});

    if(post) {
        user.bookmarkedTips.push(req.params.id);
        await user.save();
        req.session.user = user;
        res.send({success: true, message:'Bookmarked!'});
        return;
    } else {
        res.send({success: false, message:'Could not bookmark'});
    }
});

router.post('/unbookmark/:id', async (req, res) => {
    if(!req.session.user) {
        res.send('Unauthorized!');
        return;
    }

    const user = await User.findOne({_id: req.body.id});

    if(user.bookmarkedTips) {
        let index = user.bookmarkedTips.indexOf(req.params.id)
        user.bookmarkedTips.splice(index, 1);
        await user.save();
        req.session.user = user;
        res.send({success: true, message:'Un-bookmarked!'});
        return;
    } else {
        res.send({success: false, message:'Could not bookmark'});
    }
});

router.get('/bookmarks', async (req, res) => {
    if(!req.session.user) {
        res.send('Unauthorized!');
        return;
    }

    res.send(req.session.user.bookmarkedTips);

});

router.get('/goals/:id', async (req, res) => {
    if(!req.session.user) {
        res.send('Unauthorized!');
        return;
    }

    const user = await User.findOne({_id: req.params.id});
    const goals = user.goals;

    res.send(goals);
});

router.put('/goal/:id', async (req, res) => {
    if(!req.session.user) {
        res.send('Unauthorized!');
        return;
    }

    let user = await User.findOne({_id: req.params.id});
    user.goals.push(req.body.goal);

    await user.save().then((data) => {
        res.send({success: true})
    }).catch((err) => {
        res.send({success: false})
    });
});

router.put('/remove-goal/:id', async (req, res) => {
    if(!req.session.user) {
        res.send('Unauthorized!');
        return;
    }

    let user = await User.findOne({_id: req.params.id});
    let index = user.goals.indexOf(req.body.goal);
    user.goals.splice(index, 1);

    await user.save().then((data) => {
        res.send({success: true})
    }).catch((err) => {
        res.send({success: false})
    });
})


module.exports = router;