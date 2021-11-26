
const _ = require("lodash");
const InvariantError = require("../../exceptions/InvariantError");

class BlockServices {
  constructor(userBlock, domainBlock, anonymousBlock) {
    this._userBlock = userBlock;
    this._domainBlock = domainBlock;
    this._anonymousBlock = anonymousBlock;
  }


  getHasBlock(post) {
    try {
      let newArr = this.#privateProcessBlock(post);
      console.log(newArr);
      return this.#processAnonymousBlock(newArr);
    } catch (err) {
      console.log(err);
      throw new InvariantError('Invalid block proses')
    }

  }

  #privateProcessBlock(post) {
    let listBlock = String(this._userBlock + this._domainBlock);
    return _.filter(post, function (o) {
      return !listBlock.includes(o.actor.id);
    });
  }

  #processAnonymousBlock(post) {
    let listAnonymous = this._anonymousBlock.map((value) => {
      return value.post_anonymous_id_blocked;
    });

    let feedWithAnonymous = post.reduce((feed, current) => {
      if (!listAnonymous.includes(current.id)) {
        feed.push(current);
      }
      return feed;
    }, []);
    return feedWithAnonymous;
  }
}

module.exports = BlockServices;