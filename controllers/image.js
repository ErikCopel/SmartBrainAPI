const handleImage = (db) => (req, res) => {
    const { userId } = req.body;
    console.log("USER ID:", userId);
    db('users').where('id', '=', userId)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            res.json(entries[0].entries);
        })
        .catch(err => res.status(400).json('unable to get entries'));
};

module.exports = {
    handleImage: handleImage
};