import CMS from '../models/CMS.js';
import AppError from '../utils/AppError.js';

export const getCMSPage = async (req, res, next) => {
  try {
    const { pageType } = req.params;
    const page = await CMS.findOne({ pageType });
    if (!page) return next(new AppError(`CMS page '${pageType}' not found.`, 404));
    res.status(200).json({ status: 'success', data: { page } });
  } catch (err) { next(err); }
};

export const getAllCMSPages = async (req, res, next) => {
  try {
    const pages = await CMS.find().select('pageType title isPublished updatedAt');
    res.status(200).json({ status: 'success', data: { pages } });
  } catch (err) { next(err); }
};

export const upsertCMSPage = async (req, res, next) => {
  try {
    const { pageType } = req.params;
    const validTypes = ['homepage', 'about', 'contact', 'privacy', 'terms', 'shipping', 'returns', 'faq', 'policy'];
    if (!validTypes.includes(pageType)) return next(new AppError('Invalid pageType.', 400));
    const page = await CMS.findOneAndUpdate(
      { pageType },
      { ...req.body, pageType, lastEditedBy: req.user._id },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json({ status: 'success', data: { page } });
  } catch (err) { next(err); }
};
