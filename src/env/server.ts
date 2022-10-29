import express, { Request, Response } from "express";
import { createTerraformGenerator } from './boilertf';
import { createTfInstance } from "./instance";

const app = express();

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World");
    }
);

app.get("/vpc", (req: Request, res: Response) => {
    const tfg = createTerraformGenerator();
    res.send(tfg.toString());
    }
);

app.get("/instance", (req: Request, res: Response) => {
    const tf = createTfInstance();
    res.send(tf);
    }
);

app.listen(3000, () => {
    console.log("Server running on port 3000");
}
);