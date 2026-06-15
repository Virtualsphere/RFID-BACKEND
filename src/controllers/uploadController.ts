import { Request, Response } from 'express';

export const uploadImage = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  // Return the path that will be served by the static route
  res.send(`/${req.file.path.replace(/\\/g, '/')}`);
};

export const uploadImages = (req: Request, res: Response) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return res.status(400).send('No files uploaded');
  }
  // Return the paths
  const paths = req.files.map(file => `/${file.path.replace(/\\/g, '/')}`);
  res.json(paths);
};
