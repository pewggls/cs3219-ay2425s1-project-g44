[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/bzPrOe11)
# CS3219 Project (PeerPrep) - AY2425S1
## Group: G44


### API Endpoints
The question microservice exposes the following API endpoints:
- ```questions/all``` - Returns all the questions available on the database.
- ```questions/byId/[Question ID]``` - Returns a single question by ID number.
- ```questions/maxQuestionId``` - Returns the highest question ID currently being stored in the database. (Can be used for adding new Questions).
- ```filter/q/?categories=Arrays,Bit%20Manipulation&complexities=Easy,Medium&keywords=algebra,geometry``` - Returns all questions that have Arrays AND/OR Bit Manipulation tags, are either Easy OR Medium, and contain the keywords "algebra" or "geometry".
- ```questions/add``` - Adds a new question to the database.
- ```questions/delete/[Question ID]``` - Deletes a question from the database by ID number.
- ```questions/update/[Question ID]``` - Updates a question from the database by ID number.
- ```questions/patch/[Question ID]``` - Patches a question from the database by ID number.

### Running PeerPrep
In the root directory, ```backend/question-service```, and ```frontend``` folders, run
```sh
npm install
```
Then, in the project root, run
```sh
npm run start
```
and access PeerPrep at [localhost:3000](http://localhost:3000)

### Note: 
- You can choose to develop individual microservices within separate folders within this repository **OR** use individual repositories (all public) for each microservice. 
- In the latter scenario, you should enable sub-modules on this GitHub classroom repository to manage the development/deployment **AND** add your mentor to the individual repositories as a collaborator. 
- The teaching team should be given access to the repositories as we may require viewing the history of the repository in case of any disputes or disagreements. 
