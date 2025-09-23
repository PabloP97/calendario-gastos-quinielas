import { useState, useCallback } from 'react';
import { ConfirmationAction } from '../ConfirmationModal';

export function useConfirmation() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<ConfirmationAction | null>(null);

  const showConfirmation = useCallback((action: ConfirmationAction) => {
    setCurrentAction(action);
    setIsOpen(true);
  }, []);

  const hideConfirmation = useCallback(() => {
    setIsOpen(false);
    setCurrentAction(null);
  }, []);

  return {
    isOpen,
    currentAction,
    showConfirmation,
    hideConfirmation,
  };
}