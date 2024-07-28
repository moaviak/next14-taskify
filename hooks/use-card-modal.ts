import { create } from "zustand";

type CardModalStore = {
  id?: string;
  isOpen: boolean;
  onOpen: (id: string) => void;
  onClose: () => void;
};

export const useCardModal = create<CardModalStore>((set) => ({
  id: undefined,
  isOpen: false,
  onOpen: (id: string) => set((state) => ({ isOpen: true, id })),
  onClose: () => set((state) => ({ isOpen: false, id: undefined })),
}));
