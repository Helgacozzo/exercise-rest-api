import express from "express";
import path from "path";
import morgan from "morgan";


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
    fs.writeFileSync(path.resolve(`./database/${resourceName}.json`), data);
}

const generateId = (resourceName) => {
    const resource = readResource(resourceName);
    const ids = resource.map(b => b.id);
    for (let i = 0; i <= ids.length; i++) {
        if (!ids.includes(i)) {
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
        if (element.id === Number(id)) {
            indexOfDelete = i;
            break;
        }
    }
    if (resourceIndex === undefined) {
        res.status(404).send(`There is no ${resourceName} resource with ID ${id}.`)
        return [];
    }
    return [resource[resourceIndex], resourceIndex];
}


const app = express();
app.listen(3000, () => {
    console.log('il server è attivo e in ascolto sulla porta 3000!');
});
app.use(morgan('dev'));
app.use(express.json());


app.get('/books', (req, res) => {
    res.sendFile(path.resolve('./database/books.json'));
});

app.post('/books', (req, res) => {
    const newBook = req.body;
    let isBookvalid = true;
    isBookvalid &= Object.keys(newBook).length === 3;
    ['title', 'author', 'year'].forEach((key) => {
        isBookvalid &= value[key] !== undefined;
    });
    if (!isBookvalid) {
        res.status(400).send("Books must have title, author and year property");
        return;
    }
    const books = readResource('books');
    newBook.id = generateId('books');
    books.push(newBook);
    writeResource('books', books);
    res.send(newBook);
});


app.get('/books/:id', (req, res) => {
    const [book] = getSingleResource('books', req, res)
    res.send(book);
});

app.put('/books/:id', (req, res) => {
    const newBook = req.body;
    let isBookvalid = true;
    isBookvalid &= Object.keys(newBook).length === 3;
    ['title', 'author', 'year'].forEach((key) => {
        isBookvalid &= value[key] !== undefined;
    });
    if (!isBookvalid) {
        res.status(400).send("Books must have title, author and year property");
        return;
    }
    const [, indexToUpdate] = getSingleResource('books', req, res);
    const books = readResource('books');
    newBook.id = req.params.id;
    books[indexToUpdate] = newBook;
    writeResource('books', books);
    res.send(newBook);
});

app.patch('/books/:id', (req, res) => {
    const newProperties = req.body;
    let isPropertiesValid = Object.keys(newProperties).length <= 3;
    Object.keys(newProperties).forEach((key) => {
        isPropertiesValid &= ['title', 'author', 'year'].includes(key);
    })
    if (!isBookvalid) {
        res.status(400).send("Properties must be 3 only and with name key 'title', 'author' or 'year'.");
        return;
    }
    const [, indexToUpdate] = getSingleResource('books', req, res);
    const books = readResource('books');
    books[indexToUpdate] = {...books[indexToUpdate], ...newProperties};
    writeResource('books', books);
    res.send(newBook);
});

app.delete('/books/:id', (req, res) => {
    const { id } = req.params;
    const books = readResource('books');
    const [, indexOfDelete] = getSingleResource('books', req.res);
    books.splice(indexOfDelete, 1);
    writeResource('books', books);
    res.send(`Book with id ${id} deleted correctly.`);
})

