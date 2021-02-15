function searchSubmit(all_topics, search) {
    all_topics = all_topics.split(",");

    const options = {
        isCaseSensitive: false,
        // includeScore: false,
        // shouldSort: true,
        // includeMatches: false,
        // findAllMatches: false,
        // minMatchCharLength: 1,
        // location: 0,
        // threshold: 0.6,
        // distance: 100,
        // useExtendedSearch: false,
        // ignoreLocation: false,
        // ignoreFieldNorm: false,
      };
      
      const fuse = new Fuse(all_topics, options);
      
      // Change the pattern
      const pattern = search;

      var res = document.getElementById("results");
      var text = document.createTextNode(JSON.stringify(fuse.search(pattern)));

      res.appendChild(text);

      return false;
}