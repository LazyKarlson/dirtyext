T.define({
  ru: {
    /*
    $plural: function(n) {
      return 'other';
    },
    */
    //$aux: {       
      comments:        { $plural: { one: '{} новый комментарий в инбоксе', few: '{} новых комментария в инбоксе', other: '{} новых комментариев в инбоксе' } },
      new_comments: {
      uploaded:    '{>comments comments}',      
    },
  },
});