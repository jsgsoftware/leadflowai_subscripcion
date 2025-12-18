const getExample = (req, res) => {
  res.status(200).json({
    message: 'This is an example response from the controller!',
  });
};

module.exports = {
  getExample,
};
