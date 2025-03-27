import Announcement from "../../models/announcement.js";

export const addAnnouncement = async (req, res) => {
  try {
    const { title, content, author } = req.body;

    const newAnnouncement = new Announcement({
      title,
      content,
      author,
    });

    const savedAnnouncement = await newAnnouncement.save();

    res.status(201).json({ message: "Announcement added successfully", announcement: savedAnnouncement });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
