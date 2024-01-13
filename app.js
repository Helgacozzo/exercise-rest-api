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

const generateId = (resourceName, resource) => {
    const resource = readResource(resourceName);
    const ids = resource.map(b => b.id);
    for(let i=0; i<=ids.length; i++){
        if(!ids.includes(i)){
            return i;
        }
    }
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

app.get('/books/:id', (req, res) => {
    const { id } = req.params;
    const books = readResource('books');
    const book = books.filter(b => b.id === Number(id))[0];
    if(!book){
        res.status(404).send(`Book with id ${id} not found.`):
        return;
    }
    res.send(book);
});


app.post('/books', (req, res) => {
    const newBook = req.body;
    let isBookvalid = true;
    ['title', 'author', 'year'].forEach((key) => {
        isBookvalid &= value[key] !== undefined;
    });
    if(!isBookvalid){
        res.status(400).send("Books must have title, author and year property");
        return;
    }
    const books = readResource('books');
    newBook.id = generateId('books');
    books.push(newBook);
    writeResource('books', books);
    res.send(newBook);
});


