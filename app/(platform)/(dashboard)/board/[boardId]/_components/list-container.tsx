"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { toast } from "sonner";

import { useAction } from "@/hooks/use-action";
import { updateListOrder } from "@/actions/update-list-order";
import { updateCardOrder } from "@/actions/update-card-order";
import { ListWithCards } from "@/types";

import { ListForm } from "./list-form";
import { ListItem } from "./list-item";

interface ListContainerProps {
  data: ListWithCards[];
  boardId: string;
}

function reorder<T>(List: T[], startIndex: number, endIndex: number) {
  const result = Array.from(List);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

export const ListContainer = ({ data, boardId }: ListContainerProps) => {
  const [orderedData, setOrderedData] = useState(data);

  const { execute: executeUpdateListOrder } = useAction(updateListOrder, {
    onSuccess: () => {
      toast.success("List reordered.");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const { execute: executeUpdateCardOrder } = useAction(updateCardOrder, {
    onSuccess: () => {
      toast.success("Card reordered.");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  useEffect(() => {
    setOrderedData(data);
  }, [data]);

  const onDragEnd = (result: any) => {
    const { destination, source, type } = result;

    if (!destination) return;

    // if dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    // user moves a list
    if (type === "list") {
      const items = reorder(orderedData, source.index, destination.index).map(
        (item, index) => ({ ...item, order: index })
      );

      setOrderedData(items);

      executeUpdateListOrder({ items, boardId });
    }

    // user moves a card
    if (type === "card") {
      let newOrderedData = [...orderedData];

      // source and destination list
      const srcList = newOrderedData.find(
        (list) => list.id === source.droppableId
      );
      const destList = newOrderedData.find(
        (list) => list.id === destination.droppableId
      );

      if (!srcList || !destList) return;

      // check if cards exists on the source list
      if (!srcList.cards) {
        srcList.cards = [];
      }

      // check if cards exists on the destination list
      if (!destList.cards) {
        destList.cards = [];
      }

      // moving the card in the same list
      if (source.droppableId === destination.droppableId) {
        const reorderedCards = reorder(
          srcList.cards,
          source.index,
          destination.index
        );

        reorderedCards.forEach((card, idx) => {
          card.order = idx;
        });

        srcList.cards = reorderedCards;

        setOrderedData(newOrderedData);

        executeUpdateCardOrder({ boardId, items: reorderedCards });
      } else {
        // user moves card to the other list
        // remove card from source list
        const [movedCard] = srcList.cards.splice(source.index, 1);

        // assign the new listId to moved card
        movedCard.listId = destination.droppableId;

        // Add card to the destination list
        destList.cards.splice(destination.index, 0, movedCard);

        srcList.cards.forEach((card, idx) => {
          card.order = idx;
        });

        // update the order for each card in the destination list
        destList.cards.forEach((card, idx) => {
          card.order = idx;
        });

        setOrderedData(newOrderedData);

        executeUpdateCardOrder({ boardId, items: destList.cards });
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="lists" type="list" direction="horizontal">
        {(provided) => (
          <ol
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex gap-x-3 h-full"
          >
            {orderedData.map((list, index) => (
              <ListItem key={list.id} index={index} data={list} />
            ))}
            {provided.placeholder}
            <ListForm />
            <div className="flex-shrink-0 w-1" />
          </ol>
        )}
      </Droppable>
    </DragDropContext>
  );
};
