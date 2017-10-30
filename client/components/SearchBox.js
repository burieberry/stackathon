import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setLocation, searchYelp, searchFoursquare } from '../store';
import Results from './Results';
import axios from 'axios';

class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick(ev) {
    ev.preventDefault();
    const { setLocation, searchYelp, searchFoursquare } = this.props;
    this.textInput.focus();
    const place = this.textInput.value.split(',')[0];

    const service = new google.maps.places.PlacesService(document.getElementById('map'));
    service.textSearch({ query: this.textInput.value}, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        // console.log('All results:', results);

        const placeId = results[0].place_id;
        service.getDetails({ placeId }, (result, status) => {
          // console.log('Place details:', result);
          setLocation(result);
        });

        const geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&key=${googleKey}`;
        return axios.get(geocodeURL)
          .then(res => res.data)
          .then(response => {
            // console.log(response);
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
      this.onClick();
    });
  }

  componentWillUnmount() {
    this.textInput.onClick('destroy');
  }

  render() {
    const { location, yelpLocation, fsLocation } = this.props;
    const { onClick } = this;

    return (
      <div>
        <input ref={ input => this.textInput = input } type="text" size="50" />
        <button type="submit" onClick={ onClick }>Submit</button>
        <div className="row">
          <Results location={ location } head="Google" />
          <Results location={ yelpLocation } head="Yelp" />
          <Results location={ fsLocation } head="Foursquare" />
        </div>
        <div id="map" />
      </div>
    )
  }
}

const mapStateToProps = ({ location, yelpLocation, fsLocation }) => {
  return { location, yelpLocation, fsLocation };
};

const mapDispatch = { setLocation, searchYelp, searchFoursquare };

export default connect(mapStateToProps, mapDispatch)(SearchBox);
