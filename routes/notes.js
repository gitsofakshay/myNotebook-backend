const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes');
const fetchuser = require('../middleware/fetchUser');
const { body, validationResult } = require('express-validator');

//Route 1: fetch all notes using : GET "/api/notes/fetchallnotes" . Login required.
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    let success = false;
    try {
        //fetching all notes associated with the user
        const notes = await Notes.find({ user: req.user.id });
        success = true;
        res.status(200).json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({success,error: error.message});
    }
});

//Route 2: Add a new Note using : POST "/api/notes/addnotes" . Login required.
router.post('/addnotes', fetchuser, [
    body('title', 'Title must be atleast 3 characters').isLength({ min: 3 }),
    body('description', 'Description should be atleast 5 character').isLength({ min: 5 }),
], async (req, res) => {
    let success = false;
    try {
        //If there are error return bad request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({success, errors: errors.array() });
        }

        const { title, description, tag } = req.body;
        //Adding notes to a specific user
        const note = new Notes({ title, description, tag, user: req.user.id });
        const savedNote = await note.save();
        success = true;
        res.status(200).json({success,msg: 'Note has been added', savedNote: savedNote}); 
    } catch (error) {
        console.error(error.message);
        res.status(500).json({success, error: 'Internal Server error'});
    }
});

//Route 3: updating an existing Note using : PUT "/api/notes/updatenotes/" . Login required.
router.put('/updatenotes/:id', fetchuser, async (req, res) => {
    let success = false;
    try {
        //Updating an existing note to a specific user
        const { title, description, tag } = req.body;

        const newNote = {};
        if(title){newNote.title = title};
        if(description){newNote.description = description};
        if(tag){newNote.tag = tag};

        //Find the note to be updated and update it
        let note = await Notes.findById(req.params.id);
        if(!note){return res.status(404).json({success,error: "Not found"})};

        //Allow updation only if user owns the Note
        if(note.user.toString() != req.user.id){
            return res.status(401).json({success,error: "Not Allowed"});
        }

        note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true});
        success = true;
        res.status(200).json({success, msg: 'Note has been updated', note: note});
    } catch (error) {
        console.error(error.message);
        res.status(500).json({success, error: 'Internal Server error'});
    }
});

//Route 4: Delete an existing Note using : DELETE "/api/notes/deletenotes/" . Login required.
router.delete('/deletenotes/:id', fetchuser, async (req, res) => {
    //Deleting a note to a specific user
    let success = false;
    try {    
        //Find the note to be deleted and delete it
        let note = await Notes.findById(req.params.id);
        if(!note){return res.status(404).json({success,error: "Not found"})};

        //Allow deletion only if user owns the
        if(note.user.toString() != req.user.id){
            return res.status(401).json({success,error: "Not Allowed"});
        }

        note = await Notes.findByIdAndDelete(req.params.id);
        success = true;
        res.status(200).json({success, msg: "Note has been deleted", note: note});
    } catch (error) {
        console.error(error.message);
        res.status(500).json({success, error: 'Internal Server error'});
    }
});

module.exports = router;