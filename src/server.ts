import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { createVPC } from "./vpc"; 
import { createInstance } from "./instance";
import { createModule } from "./main";
import { createRDS } from "./rds";

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.get("/", (req: Request, res: Response) => {
    res.render('index');
});

// app.get("/instance/:region/:ip", (req: Request, res: Response) => {
//     const tf = createTfInstance(req.params.region, req.params.ip, 'test', '172.16.1.0', '172.16.2.0');
//     res.send(tf);
//     }
// );

app.post('/terraform', (req: Request, res: Response) => {
    const variables = {
        region: req.body.region,
        vpcCidr: req.body.vpc,
        project: req.body.project,
        publicCidr: req.body.publicip,
        privateCidr: req.body.privateip,
    } 
    const module = createModule(variables);
    createVPC(variables);
    createInstance(variables);
    createRDS(variables);
    res.send(module);
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
}
);