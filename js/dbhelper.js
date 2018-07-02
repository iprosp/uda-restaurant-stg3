/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Link to the server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }
  static get REVIEW_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/reviews`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {

    function addRestaurants(data){
      //console.log(`In add ${data}`);
      const restaurants = data;
      DBHelper.addToDatabase(restaurants);
      return restaurants;
    }
    
    function requestError(e, part){
      const error = (`There was a failed request with error ${part}`);
      callback(error, null);
    }  

    DBHelper.getRestaurantsFromCache().then(restaurants => {
      if(restaurants.length) {
        return Promise.resolve(restaurants);
      } else {
        return fetch(DBHelper.DATABASE_URL).then(response => response.json())
        .then(addRestaurants).catch(e => requestError(e, 'json'));
      }
    }).then(restaurants => {
      callback(null, restaurants);
    }).catch(error => {
      callback(error, null);
    })
  }

  /**
   * Fetch a restaurant by its ID.
   */
   
  static fetchRestaurantById(id, callback) {
   DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) {
          callback(null, restaurant);
        } else {
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}.webp`);
  }
  static imageSrcSetForRestaurant(restaurant) {  
    return (`/img/w270/${restaurant.photograph}.webp 270w, /img/w540/${restaurant.photograph}.webp 540w, /img/w270/${restaurant.photograph}.webp 800w`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }
  

  //Base functions
  static openDatabase() {
    // If the browser doesn't support service worker,
    // we don't care about having a database
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }

    return idb.open('restaurant', 1, upgradeDb => {
      var store = upgradeDb.createObjectStore('restaurants', {
        keyPath: 'id'
      });
      var revStore =  upgradeDb.createObjectStore('reviews', { 
        keyPath: 'id' 
      });
      var revStoreOffline =  upgradeDb.createObjectStore('reviewsOffline', { 
        keyPath: 'id' 
      });
    });
  }
  
  static addToDatabase(restaurantList) {
    var dbPromise = this.openDatabase();
    return dbPromise.then(db => {
      if (!db) return;
      const tx = db.transaction('restaurants', 'readwrite');
      const restaurantStore = tx.objectStore('restaurants');
      restaurantList.forEach(restaurant => {
        //console.log(`Restaurant:${restaurant}`);
        restaurantStore.put(restaurant);
      });
    });
    return tx.complete;
  }

  static addReviewsToDatabase(reviews) {
    var dbPromise = this.openDatabase();
    return dbPromise.then(db => {
      if (!db) return;
      const tx = db.transaction('reviews', 'readwrite');
      const revStore = tx.objectStore('reviews');
      reviews.forEach(review => {
        revStore.put(review);
      });
    });
    return tx.complete;
  }

  static addReviewsOfflineToDatabase(review) {
    var dbPromise = this.openDatabase();
    return dbPromise.then(db => {
      if (!db) return;
      const tx = db.transaction('reviewsOffline', 'readwrite');
      const revStoreOffline = tx.objectStore('reviewsOffline');
      revStoreOffline.put(review);
    });
    return tx.complete;
  }

  /**
   * Delete entries from restaurant idb.
   */
  static deleteRestaurant(id) {
    var dbPromise = this.openDatabase();
    return dbPromise.then(db => {
     // console.log(`The restaurant ID: ${id}`);
      if (!db) return;
      const tx = db.transaction('restaurants', 'readwrite');
      const restaurantStore = tx.objectStore('restaurants').delete(id);
    });
    return tx.complete;
  }

  /**
   * Delete entries from offline reviews.
   */
  static deleteOffRevDatabase(id) {
    var dbPromise = this.openDatabase();
    return dbPromise.then(db => {
      console.log(`The offDB ID: ${id}`);
      if (!db) return;
      const tx = db.transaction('reviewsOffline', 'readwrite');
      const revStore = tx.objectStore('reviewsOffline').delete(id);
    });
    return tx.complete;
  }
  
  static getRestaurantsFromCache() {
    return DBHelper.openDatabase().then(db => {
      if (!db) return;
      return db.transaction('restaurants').objectStore('restaurants').getAll();
    });
  }

  static getReviewsFromCache() {
    return DBHelper.openDatabase().then(db => {
      if (!db) return;
      return db.transaction('reviews').objectStore('reviews').getAll();
    });
  }

  static getOfflineReviewsFromCache() {
    return DBHelper.openDatabase().then(db => {
      if (!db) return;
      return db.transaction('reviewsOffline').objectStore('reviewsOffline').getAll();
    });
  }


  /**
   * Get all reviews for a restaurant by id
   */
  static getReviewsByID(id, callback){
    fetch(DBHelper.REVIEW_URL+'?restaurant_id='+id).then((response) => {
      return response.json()
    }).then(reviews => {
      callback(null, reviews);  
      DBHelper.addReviewsToDatabase(reviews);
    }).catch(error => {
      let reviews = this.getReviewsFromCache().then((reviews) => {
        return Promise.resolve(reviews);
      }).then(reviews => {
        callback(null, reviews);
      }).catch(error => {
        callback(error, null);
      })

    })
  }

  /**
   * Sets the is_favorite status of a Restaurant
   */
  static setRestFavoriteStat(status, restaurant_id){
    fetch(DBHelper.DATABASE_URL + `/${restaurant_id}/?is_favorite=${status}`, {
      method: 'PUT',
      headers:{ 'Content-Type': 'application/json' }
    }).then(response => {
      console.log('Changed favorite status:', response);
      return response.json();
    }).catch(error => {
      console.log(error);
    })
  };

  /**
   * Saves a review to the server
   */
  static postReview(reviewData){
    fetch(DBHelper.REVIEW_URL, {
      body: JSON.stringify(reviewData),
      method: 'POST',
    }).then(response => {
      console.log('Review post to server response:', response);
    }).catch(error => {
      console.log(error);
    })
  }
 


}
