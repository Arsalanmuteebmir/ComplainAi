import {Router} from 'express';import {searchLocations} from '../controllers/location.controller.js';const r=Router();r.get('/search',searchLocations);export default r;
