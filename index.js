const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs');
const app = express()
const port = 3000;
app.use((req, res, next) => {
    console.log(`Request URL: ${req.originalUrl}`);
    next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/user/:name', (req, res) => {
    res.send(`halo ${req.params.name}`);
});

app.get('/users', (req, res) => {
    res.json({
        data: 'ini adalah data user',
        code: 200,
    });
});

app.post('/users/json', (req, res) => {
    console.log('type json', req.body)
    res.json({
        data: {...req.body, type: 'json'},
        code: 200,
    });
})

app.post('/users/url-encoded', (req, res) => {
    console.log('type url-encoded', req.body)
    req.body = {...req.body, type: 'url-encoded'};
    res.json({
        data: req.body,
        code: 200
    });
})

const rawData = fs.readFileSync('./db_custom_paged.json');
const data = JSON.parse(rawData).employee;

app.get('/employee', (req, res) => {
    const keyword = req.query.keyword?.toString().toLowerCase() || '';
    const page = parseInt(req.query.page, 10) || 1;
    const rowsPerPage = parseInt(req.query.rowsPerPage, 10) || 10;
    const sort = req.query.sort === 'desc' ? 'desc' : 'asc';
    const order = req.query.order || 'username';
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = page * rowsPerPage;
  
    const filtered = data.filter(emp => 
      emp.username.toLowerCase().includes(keyword) ||
      emp.firstName.toLowerCase().includes(keyword) ||
      emp.lastName.toLowerCase().includes(keyword)
    );

    const sorted = filtered.sort((a, b) => {
      let aVal = a[order], bVal = b[order];
      if (order === 'fullname') {
        aVal = `${a.firstName} ${a.lastName}`.toLowerCase();
        bVal = `${b.firstName} ${b.lastName}`.toLowerCase();
      }
  
      if (typeof aVal === 'string') return sort === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      if (typeof aVal === 'number') return sort === 'asc' ? aVal - bVal : bVal - aVal;
      return 0;
    });
  
    const paginated = sorted.slice(startIndex, endIndex);
    res.json({
      data: {
        employee: paginated
      },
      paging: {
        page,
        rowsPerPage,
        totalRows: filtered.length,
        totalPages: Math.ceil(filtered.length / rowsPerPage)
      }
    });
});
  

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})