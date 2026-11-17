# Task 4 submission checklist — SnackStock

Use this as a final team verification sheet. Mark an item complete only after your team has run or demonstrated it.

- [ ] Faculty-approved problem statement, target users, bounded scope, and user stories.
- [x] Architecture, wireframe, ERD, API, and test-plan documents are included under `docs/`.
- [x] React frontend and Spring Boot backend source are included.
- [x] Related relational entities: products, customer orders, and order items.
- [x] Product CRUD and order lifecycle operations are represented by API endpoints.
- [x] Product search and order-status filtering are implemented/documented.
- [x] Client-side validation and backend validation/error responses are present.
- [x] Controller → service → repository → JPA entity persistence separation is present.
- [x] Backend unit/business-rule tests and a controller integration test are included; frontend validation tests are included.
- [x] React consumes a documented Spring REST API boundary; API endpoint list is in `docs/api.md`.
- [ ] Run `mvn test`, `npm test`, and `npm run build` on the final extracted archive and retain the output as evidence.
- [ ] Configure PostgreSQL using authorised credentials and test the complete workflow against it.
- [ ] Deploy frontend and backend, verify both URLs, and add screenshots/demo evidence.
- [ ] Add each member's contribution statement and verify all team details in the presentation.

**Scope note:** The project demonstrates a separately deployable REST API boundary between React and Spring Boot. It does not claim a separate additional microservice. If the faculty requires a distinct microservice rather than an independently deployable API, obtain approval or extend the implementation accordingly.
