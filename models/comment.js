const mongoose = require('mongoose');
const Comment = mongoose.model('Comment');
const constant = require('../Utils/constant');


module.exports = {
  getComments(query, option){
    option = option || {};
    let findPromise = Comment.find(query)
                          .select({});
    if (option.perPage){
      findPromise = findPromise.limit(option.perPage);
      if (option.page){
        findPromise = findPromise.skip(option.perPage * (option.page - 1));
      }
    }
    if (option.sort){
      findPromise = findPromise.sort(option.sort);
    }
    return findPromise
          .populate('user')
          .exec();
  },
  getCountComment(query){
    return Comment.count(query).exec();
  },
  // Add comment
  async addComment(dishID, userID, content ){
    return new Comment({
      dishID: dishID,
      userID: userID,
      content: content,
      createdDate: Date.now()
    }).save();
  }
};
