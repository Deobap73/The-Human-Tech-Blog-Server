// ✅ Relative path: src/controllers/sponsor.controller.ts

import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import Sponsor from '../models/Sponsor';

export const getSponsors = async (_req: Request, res: Response) => {
  const sponsors = await Sponsor.find();
  res.status(200).json(sponsors);
};

export const createSponsor = async (req: Request, res: Response) => {
  try {
    const { name, website } = req.body;

    const file = req.file as Express.Multer.File | undefined;
    if (!file) {
      return res.status(400).json({ message: 'Logo file is required' });
    }

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream({ folder: 'sponsors' }, (err, result) => {
        if (err || !result) return reject(err);
        return resolve(result as { secure_url: string });
      });
      file.stream.pipe(upload);
    });

    const sponsor = new Sponsor({
      name,
      website,
      logoUrl: result.secure_url,
    });

    await sponsor.save();
    return res.status(201).json(sponsor);
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateSponsor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, website } = req.body;

    const sponsor = await Sponsor.findById(id);
    if (!sponsor) {
      return res.status(404).json({ message: 'Sponsor not found' });
    }

    const file = req.file as Express.Multer.File | undefined;
    if (file) {
      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream({ folder: 'sponsors' }, (err, result) => {
          if (err || !result) return reject(err);
          return resolve(result as { secure_url: string });
        });
        file.stream.pipe(upload);
      });

      sponsor.logoUrl = result.secure_url;
    }

    sponsor.name = name || sponsor.name;
    sponsor.website = website || sponsor.website;

    await sponsor.save();
    return res.status(200).json(sponsor);
  } catch (error) {
    console.error('Update sponsor error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteSponsor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sponsor = await Sponsor.findByIdAndDelete(id);

    if (!sponsor) {
      return res.status(404).json({ message: 'Sponsor not found' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Delete sponsor error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
