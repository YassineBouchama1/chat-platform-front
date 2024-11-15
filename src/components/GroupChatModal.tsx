import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

import Modal from "./Modal";
import Input from "./inputs/Input";
import Select from "./inputs/Select";
import Button from "./Button";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { Member } from "../types/chat";

interface GroupChatModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

// Fetch users
const fetchUsers = async (): Promise<Member[]> => {
  try {
    const response = await axiosInstance.get("/user");
    // Vérification de la structure des données
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error(
        "La réponse des utilisateurs n'est pas un tableau",
        response.data
      );
      return [];
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return [];
  }
};

// Create a new group chat
const createGroupChat = async (groupData: {
  name: string;
  members: string[];
}) => {
  const response = await axiosInstance.post("/chats", {
    ...groupData,
    isGroup: true,
  });
  return response.data;
};

const GroupChatModal: React.FC<GroupChatModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: users = [], isPending: loadingUsers } = useQuery<
    Member[],
    Error
  >({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5,
  });
  console.log(users);

  // Group chat creation mutation
  const createGroupMutation = useMutation<
    void,
    Error,
    { name: string; members: string[] }
  >({
    mutationFn: createGroupChat,
    onSuccess: () => {
      toast.success("Group chat created successfully!");
      queryClient.invalidateQueries({ queryKey: ["group-chats"] });
      onClose();
    },
    onError: (error) => {
      console.log(error);
      
      toast.error(`Failed to create group: ${error.message}`);
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      members: [],
    },
  });

  const members = watch("members");

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    // Extraire uniquement les valeurs des `value` des objets
    const memberIds = data.members.map((member: { value: string }) => member.value);
  
    // Afficher les IDs extraits
    console.log("Extracted member IDs:", memberIds);
  
    // Appeler la mutation avec les données formatées correctement
    createGroupMutation.mutate({
      name: data.name,
      members: memberIds,
    });
  };
  

  const loadingGroupCreation = createGroupMutation.isPending;

  // Vérifier que 'users' est un tableau avant de l'utiliser
  const userOptions = Array.isArray(users)
    ? users.map((user) => ({
        value: user._id,
        label: user.username,
      }))
    : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Create a group chat
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Create a chat with more than 2 people.
            </p>
            <div className="mt-10 flex flex-col gap-y-8">
              <Input
                disabled={loadingGroupCreation}
                label="Name"
                id="name"
                errors={errors}
                required
                register={register}
              />
              <Select
                disabled={loadingUsers || loadingGroupCreation}
                label="Members"
                options={userOptions}
                onChange={(value) =>
                  setValue("members", value, {
                    shouldValidate: true,
                  })
                }
                value={members}
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Button
            disabled={loadingGroupCreation}
            onClick={onClose}
            type="button"
            secondary
          >
            Cancel
          </Button>
          <Button disabled={loadingGroupCreation} type="submit">
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GroupChatModal;
