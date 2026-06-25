const Destination = require('../models/Destination.model');

const getDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find({ user: req.user._id });
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addDestination = async (req, res) => {
  try {
    const { name, continent, budget, note } = req.body;
    const destination = await Destination.create({
      user: req.user._id,
      name, continent, budget, note
    });
    res.status(201).json(destination);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(destination);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDestination = async (req, res) => {
  try {
    await Destination.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDestinations, addDestination, updateDestination, deleteDestination };
