import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const AlternativeActions = () => {
  return (
    <div className="text-center">
      <p className="text-sm text-gray-200 mb-4">
        Don't have an account?{' '}
        <Link 
          to="/user-registration" 
          className="text-blue-300 hover:text-blue-200 font-medium transition-colors"
        >
          Create one here
        </Link>
      </p>
    </div>
  );
};

export default AlternativeActions;