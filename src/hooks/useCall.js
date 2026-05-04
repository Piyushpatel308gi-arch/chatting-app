import { useContext } from 'react';
import { CallContext } from '../contexts/CallContext';

export const useCall = () => useContext(CallContext);
