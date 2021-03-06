import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { setLocation, searchYelp, searchFoursquare } from '../store';
import Results from './Results';

class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick(ev) {
    ev.preventDefault();
    const { setLocation, searchYelp, searchFoursquare } = this.props;
    // this.textInput.focus();
    this.props.history.push({ search: `?search=${ this.textInput.value }` });
    const place = this.textInput.value.split(',')[0];


    const service = new google.maps.places.PlacesService(document.getElementById('map'));
    service.textSearch({ query: this.textInput.value}, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        const placeId = results[0].place_id;
        service.getDetails({ placeId }, (result, status) => {
          setLocation(result);
        });

        const geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&key=${googleKey}`;
        return axios.get(geocodeURL)
          .then(res => res.data)
          .then(response => {
            const { location } = response.results[0].geometry;
            searchYelp(location, place);
            searchFoursquare(location, place);
          })
      }
    });
  }

  componentDidMount() {
    const autocomplete = new google.maps.places.SearchBox(this.textInput);
    autocomplete.addListener('place changed', () => {
      const places = autocomplete.getPlaces();
      // this.onClick();
    });
  }

  componentWillUnmount() {
    this.textInput.onClick('destroy');
  }

  render() {
    const { location, yelpLocation, yelpReviews, fsLocation, fsReviews } = this.props;
    const { onClick } = this;

    return (
      <div id="container">
        <div id="searchBox">
          <input ref={ input => this.textInput = input } type="text" id="searchBar" autoFocus="true" />
          <button type="submit" onClick={ onClick } id="search-btn" className="btn btn-lg"><i className="fa fa-search" aria-hidden="true" /></button>
        </div>
        <div id="result-hed">
          <h2>{ location.name }</h2>
          <Link className="linkToPage" to={ `${ location.url }` }>{ location.formatted_address }</Link>
          { !location.website ? '' : <span> • { location.formatted_phone_number } • <Link to={ `${ location.website }`}>Company website</Link></span>}
          <p>
          { !yelpLocation.price ? null : <strong>{ yelpLocation.price } </strong> }
          { !yelpLocation.categories ? null :
                yelpLocation.categories.map(cat => (<span key={ cat.alias }><strong className="badge badge-secondary">{ cat.title }</strong> </span>)) }</p>
          <div className="profile-img">
            { yelpLocation.image_url ? <img src={ `${ yelpLocation.image_url }` } width="250" /> : null }
          </div>
        </div>
        <div className="row">
          <Results location={ location } head="Google" />
          <Results location={ yelpLocation } yelpReviews={ yelpReviews } head="Yelp" />
          <Results location={ fsLocation } fsReviews={ fsReviews } head="Foursquare" />
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ location, yelpLocation, yelpReviews, fsLocation, fsReviews }) => {
  return { location, yelpLocation, yelpReviews, fsLocation, fsReviews };
};

const mapDispatch = { setLocation, searchYelp, searchFoursquare };

export default connect(mapStateToProps, mapDispatch)(SearchBox);

// { !yelpLocation.photos ? null :
//   yelpLocation.photos.map(photo => (<img key={ `${ photo }x` } src={ `${ photo }` } width="300" />))
// }
