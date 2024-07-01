// Import the 'express' module along with 'Request' and 'Response' types from express
import express, { NextFunction, Request, Response } from 'express';
import identityReconciliation from './libs/contact/contact';

// Create an Express application
const app = express();
app.use(express.json());
// Specify the port number for the server
const port = process.env.PORT;

// Define a route for the root path ('/')
app.post('/identify', async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { email, phoneNumber } = req.body;
        const objContactDetails = await identityReconciliation({ email, phoneNumber });
        res.status(200).json({ contact: objContactDetails });
    } catch (err) {        
        next(err);
    }
});

app.use((err, req, res, next) => {
    console.error(err, "-------------");
    const statusCode = err.statusCode ? err.statusCode : 400;
    res.status(statusCode).json({errMessage:err.message});
});

// Start the server and listen on the specified port
app.listen(port, () => {
    // Log a message when the server is successfully running
    console.log(`Server is running on http://localhost:${port}`);
});