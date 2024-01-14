# Ília - Desafio Técnico

Solution in `node.js` by `Franco Altuna` email `franco.altuna@gmail.com`

To start the server `npm run start`

To run the tests `npm run test`

```
Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
Snapshots:   0 total
Time:        0.558 s, estimated 1 s
```

Tests cover all the API cases provided in the Swagger API docs.

No enviroment variables are required to run the project or its tests. If no `DATABASE_URI` is provided a temporary in-memory mongodb instance is created. If no `PORT` is provided, port 80 will be used.
