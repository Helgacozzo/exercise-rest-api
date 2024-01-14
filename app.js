import express from "express";
import path from "path";
import morgan from "morgan";
import fs from "fs";

const readResource = async (resourceName) => {
    try {
        const data = fs.readFileSync(path.resolve(`./database/${resourceName}.json`), 'utf-8');
        const resource = JSON.parse(data);
        return resource;
    } catch (error) {
        throw new Error(error);
    }
}

const writeResource = (resourceName, resource) => {
    const data = JSON.stringify(resource);
    const directoryPath = path.resolve(`./database`);
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
    }
    fs.writeFileSync(path.resolve(`./database/${resourceName}.json`), data);
}

const generateId = (resourceName) => {
    const resource = readResource(resourceName);
    const ids = resource.map(b => Number(b.id));
    for (let i = 0; i <= ids.length; i++) {
        if (!ids.includes(Number(i))) {
            return i;
        }
    }
}

const getSingleResource = (resourceName, req, res) => {
    const { id } = req.params;
    if (id === undefined) {
        res.status(404).send(`You did not provide an ID`)
        return;
    }
    const resource = readResource(resourceName);
    let resourceIndex;
    for (let i = 0; i < resource.length; i++) {
        const element = resource[i];
        if (Number(element.id) === Number(id)) {
            resourceIndex = i;
            break;
        }
    }
    if (resourceIndex === undefined) {
        res.status(404).send(`There is no ${resourceName} resource with ID ${id}.`)
        return [];
    }
    return [resource[resourceIndex], resourceIndex];
}

const listenResource = (resourceName, keys) => {
    if (!fs.existsSync(path.resolve(`./database/${resourceName}.json`))) {
        writeResource(resourceName, []);
    }

    const app = express();
    app.listen(3000, () => {
        console.log('The server is active and listening on port 3000!');
    });
    app.use(morgan('dev'));
    app.use(express.json());

    app.get(`/${resourceName}`, (req, res) => {
        res.sendFile(path.resolve(`./database/${resourceName}.json`));
    });

    app.post(`/${resourceName}`, (req, res) => {
        const newResource = req.body;
        let isResourceValid = true;
        isResourceValid &= Object.keys(newResource).length === keys.length;
        keys.forEach((key) => {
            isResourceValid &= newResource[key] !== undefined;
        });
        if (!isResourceValid) {
            res.status(400).send(`/${resourceName} must have ${keys} properties.`);
            return;
        }
        const resourceList = readResource(resourceName);
        newResource.id = generateId(resourceName);
        resourceList.push(newResource);
        writeResource(resourceName, resourceList);
        res.send(newResource);
    });

    app.get(`/${resourceName}/:id`, (req, res) => {
        const [resource] = getSingleResource(resourceName, req, res);
        res.send(resource);
    });

    app.put(`/${resourceName}/:id`, (req, res) => {
        const newResource = req.body;
        let isResourceValid = true;
        isResourceValid &= Object.keys(newResource).length === keys.length;
        keys.forEach((key) => {
            isResourceValid &= newResource[key] !== undefined;
        });
        if (!isResourceValid) {
            res.status(400).send(`/${resourceName} must have ${keys} properties.`);
            return;
        }
        const [, indexToUpdate] = getSingleResource(resourceName, req, res);
        const resourceList = readResource(resourceName);
        newResource.id = req.params.id;
        resourceList[indexToUpdate] = newResource;
        writeResource(resourceName, resourceList);
        res.send(newResource);
    });

    app.patch(`/${resourceName}/:id`, (req, res) => {
        const newProperties = req.body;
        const numProperties = Object.keys(newProperties).length;
        if (numProperties > keys.length - 1) {
            res.status(400).send(`You can patch up ${keys.length - 1}. You can use the put method instead.`);
            return;
        }
        let isPropertiesValid = true;
        Object.keys(newProperties).forEach((key) => {
            isPropertiesValid &= keys.includes(key);
        })
        if (!isPropertiesValid) {
            res.status(400).send(`/${resourceName} must have ${keys} properties.`);
            return;
        }
        const [, indexToUpdate] = getSingleResource(resourceName, req, res);
        const resourceList = readResource(resourceName);
        resourceList[indexToUpdate] = { ...resourceList[indexToUpdate], ...newProperties };
        writeResource(resourceName, resourceList);
        res.send(resourceList[indexToUpdate]);
    });

    app.delete(`/${resourceName}/:id`, (req, res) => {
        const { id } = req.params;
        const resourceList = readResource(resourceName);
        const [, indexOfDelete] = getSingleResource(resourceName, req, res);
        resourceList.splice(indexOfDelete, 1);
        writeResource(resourceName, resourceList);
        res.send(`/${resourceName} with ID ${id} deleted correctly.`);
    })
}

listenResource('books', ['title', 'author', 'year']);
listenResource('authors', ['name', 'last_name', 'address', 'age']);
