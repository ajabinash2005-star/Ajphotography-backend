const Photo = require("../models/Photo");
const { deleteFromCloudinary } = require("../config/cloudinary");

// ── GET /api/photos  ──────────────────────────────────────────────────────
exports.getAllPhotos = async (req, res, next) => {
  try {
    const {
      category,
      featured,
      search,
      page = 1,
      limit = 20,
      sort = "-createdAt",
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (featured !== undefined) filter.isFeatured = featured === "true";
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);

    const [photos, total] = await Promise.all([
      Photo.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .select("-cloudinaryPublicId"),
      Photo.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: photos,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/photos/:id  ──────────────────────────────────────────────────
exports.getPhotoById = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id).select(
      "-cloudinaryPublicId"
    );
    if (!photo) {
      return res
        .status(404)
        .json({ success: false, message: "Photo not found." });
    }
    res.status(200).json({ success: true, data: photo });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/photos  (protected + upload middleware)  ────────────────────
exports.uploadPhoto = async (req, res, next) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success:false,
        message:"No image file provided."
      });
    }

    const {
      title,
      description,
      category,
      tags,
      isFeatured,
      order,
      cameraMeta
    } = req.body;


    if (!category) {

      await deleteFromCloudinary(req.file.filename);

      return res.status(400).json({

        success:false,

        message:"Category is required."

      });

    }


    let parsedTags = [];

    try {

      parsedTags = tags

        ? JSON.parse(tags)

        : [];

    }

    catch {

      parsedTags = tags

        ? tags
            .split(',')

            .map(t => t.trim())

            .filter(Boolean)

        : [];

    }



    let parsedCameraMeta;


    try{

      parsedCameraMeta = cameraMeta

        ? JSON.parse(cameraMeta)

        : undefined;

    }

    catch{

      parsedCameraMeta = undefined;

    }



    const photo = await Photo.create({

      title:

        title ||

        req.file.originalname,



      description,


      category,


      imageUrl:

        req.file.path,


      cloudinaryPublicId:

        req.file.filename,


      tags:

        parsedTags,


      isFeatured:

        isFeatured === "true",


      order:

        order

        ?

        Number(order)

        :

        0,


      cameraMeta:

        parsedCameraMeta,


      uploadedBy:

        req.admin._id


    });



    res.status(201).json({

      success:true,

      data:photo

    });


  }

  catch(error){

    if(req.file){

      await deleteFromCloudinary(

        req.file.filename

      ).catch(()=>{});

    }

    next(error);

  }

};

// ── PUT /api/photos/:id  (protected)  ────────────────────────────────────
exports.updatePhoto = async (req, res, next) => {
  try {
    const allowed = [
      "title",
      "description",
      "category",
      "tags",
      "isFeatured",
      "order",
      "cameraMeta",
    ];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // If a new image is uploaded, swap it
    if (req.file) {
      const existing = await Photo.findById(req.params.id).select(
        "+cloudinaryPublicId"
      );
      if (!existing) {
        await deleteFromCloudinary(req.file.filename).catch(() => {});
        return res
          .status(404)
          .json({ success: false, message: "Photo not found." });
      }
      // Delete old Cloudinary asset
      await deleteFromCloudinary(existing.cloudinaryPublicId).catch(() => {});
      updates.imageUrl = req.file.path;
      updates.cloudinaryPublicId = req.file.filename;
    }

    const photo = await Photo.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-cloudinaryPublicId");

    if (!photo) {
      return res
        .status(404)
        .json({ success: false, message: "Photo not found." });
    }

    res.status(200).json({ success: true, data: photo });
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/photos/:id  (protected)  ─────────────────────────────────
exports.deletePhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id).select(
      "+cloudinaryPublicId"
    );

    if (!photo) {
      return res
        .status(404)
        .json({ success: false, message: "Photo not found." });
    }

    // Remove from Cloudinary first
    await deleteFromCloudinary(photo.cloudinaryPublicId);
    await photo.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Photo deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/photos/categories  ───────────────────────────────────────────
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Photo.distinct("category");
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};
