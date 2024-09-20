[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/bzPrOe11)
# CS3219 Project (PeerPrep) - AY2425S1
## Group: G44

### Running PeerPrep
In the root directory, run
```sh
docker compose up -d
```
and access PeerPrep at [localhost:3000](localhost:3000)

### Developing PeerPrep
If you are developing PeerPrep, you can use `docker-compose.dev.yml` to enable [Next.js Fast Refresh](https://nextjs.org/docs/architecture/fast-refresh):
```sh
docker compose -f docker-compose.dev.yml up --watch --build
```
Due to how Docker Compose handles multiple Compose files, if you wish to run the prod version after running the dev version, you need to specify the Compose file:
```sh
docker compose -f docker-compose.yml up --build
```

### Note: 
- You can choose to develop individual microservices within separate folders within this repository **OR** use individual repositories (all public) for each microservice. 
- In the latter scenario, you should enable sub-modules on this GitHub classroom repository to manage the development/deployment **AND** add your mentor to the individual repositories as a collaborator. 
- The teaching team should be given access to the repositories as we may require viewing the history of the repository in case of any disputes or disagreements. 
