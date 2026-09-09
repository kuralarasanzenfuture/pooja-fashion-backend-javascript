import * as bankRepository from './bank.repository.js';

/**
 * Middleware to preload the bank entity onto req.bank if req.params.id is present.
 * This ensures multer storage can accurately name directories and files after the bank's actual name.
 */
export const resolveBankContext = async (req, res, next) => {
  try {
    if (req.params?.id && !req.bank) {
      const bank = await bankRepository.findById(req.params.id);
      if (bank) {
        req.bank = bank;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default {
  resolveBankContext,
};
