const {
    fetchProjects,
    fetchProjectById,
    addProject,
    updateProject,
    updateProjectStatus,
    removeProject,
    fetchProjectNotesById,
    addProjectNote,
    fetchRelationshipsByProjectId
} = require('../models');

const getProjects = (req, res, next) => {
    fetchProjects()
        .then((projects) => {
            res.status(200).send({ projects })
        })
        .catch((err) => {
            next(err)
        })
}

const getProjectById = (req, res, next) => {
    const { project_id } = req.params;

    fetchProjectById(project_id)
        .then((project) => {
            res.status(200).send({ project })
        })
        .catch((err) => {
            next(err)
        })
}

const postProject = (req, res, next) => {
    const { title, description, status, start_date, target_date } = req.body;

    addProject(title, description, status, start_date, target_date)
        .then((project) => {
            res.status(201).send({ project })
        })
        .catch((err) => {
            next(err)
        })
}

const patchProject = (req, res, next) => {
    const { project_id } = req.params;
    const updates = req.body;

    updateProject(project_id, updates)
        .then((project) => [
            res.status(200).send({ project })
        ])
        .catch((err) => {
            next(err)
        })
}

const patchProjectStatus = (req, res, next) => {
    const { project_id } = req.params;
    const { status } = req.body;

    updateProjectStatus(project_id, status)
        .then(() => {
            res.status(200).send({ message: "Project status updated" })
        })
        .catch((err) => {
            next(err)
        })
}

const deleteProject = (req, res, next) => {
    const { project_id } = req.params;

    removeProject(project_id)
    .then(() => {
        res.status(204).send()
    })
    .catch((err) => {
        next(err)
    })
}

const getProjectNotesById = (req, res, next) => {
    const { project_id } = req.params;

    fetchProjectNotesById(project_id)
        .then((project_notes) => {
            res.status(200).send({ project_notes })
        }) 
        .catch((err) => {
            next(err)
        })
}

const postProjectNote = (req, res, next) => {
    const { project_id } = req.params;
    const { body, user_id } = req.body;

    addProjectNote(project_id, body, user_id)
        .then((project_notes) => {
            res.status(204).send({ project_notes })
        })
        .catch((err) => {
            next(err)
        })
}

const getRelationshipsByProjectId = (req, res, next) => {
    const { project_id } = req.params;

    fetchRelationshipsByProjectId(project_id)
        .then((project_relationship_records) => {
            res.status(200).send({ project_relationship_records})
        })
        .catch((err) => {
            next(err)
        })
}

module.exports = {
    getProjects,
    getProjectById,
    postProject,
    patchProject,
    patchProjectStatus,
    deleteProject,
    getProjectNotesById,
    postProjectNote,
    getRelationshipsByProjectId
};