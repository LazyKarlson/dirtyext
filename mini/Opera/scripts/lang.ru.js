T.define({
  ru: {
    /*
    $plural: function(n) {
      return 'other';
    },
    */
    //$aux: {       
      comments: {
       inbox: { $plural: { one: '{} новый комментарий в инбоксе', few: '{} новых комментария в инбоксе', other: '{} новых комментариев в инбоксе' } },
       mythings: { $plural: { one: '{} новый комментарий', few: '{} новых комментария', other: '{} новых комментариев' } },
      
              },
      new_comments: {
      uploaded:    '{>comments.inbox comments}',
      added:    '{>comments.mythings comments}',      
    },
  },
});