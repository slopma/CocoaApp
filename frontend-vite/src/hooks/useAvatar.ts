import { useState } from "react";
import { supabase } from "../utils/SupabaseClient";
import { toast } from "sonner";

export function useAvatar() {
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (userId: string, file: File): Promise<string | null> => {
    try {
      setUploading(true);

      // Validar tipo de archivo
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Solo se permiten imágenes (JPEG, PNG, WEBP)");
        return null;
      }

      // Validar tamaño (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("La imagen no debe superar los 5MB");
        return null;
      }

      // Nombre único para el archivo: userId-timestamp.ext
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Verificar si ya existe un avatar anterior y eliminarlo
      const { data: existingFiles } = await supabase.storage
        .from("Cocoa-bucket")
        .list("avatars", {
          search: userId,
        });

      // Eliminar archivos anteriores del mismo usuario
      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles
          .filter((f) => f.name.startsWith(userId))
          .map((f) => `avatars/${f.name}`);
        
        if (filesToDelete.length > 0) {
          await supabase.storage.from("Cocoa-bucket").remove(filesToDelete);
        }
      }

      // Subir archivo a Supabase Storage (usar upsert para permitir reemplazo)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("Cocoa-bucket")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error details:", {
          message: uploadError.message,
          statusCode: uploadError.statusCode,
          error: uploadError,
          filePath,
          userId,
        });
        throw uploadError;
      }

      console.log("Upload successful:", uploadData);

      // Obtener URL pública de la imagen
      const { data } = supabase.storage
        .from("Cocoa-bucket")
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      // Actualizar metadata del usuario con la URL del avatar
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
        },
      });

      if (updateError) {
        throw updateError;
      }

      toast.success("Imagen de perfil actualizada exitosamente");
      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error(error.message || "Error al subir la imagen");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteAvatar = async (userId: string, currentAvatarUrl: string): Promise<boolean> => {
    try {
      setUploading(true);

      // Extraer el path del archivo de la URL
      const urlParts = currentAvatarUrl.split("/avatars/");
      if (urlParts.length < 2) {
        throw new Error("URL de avatar inválida");
      }

      const fileName = urlParts[1].split("?")[0]; // Remover query params si existen
      const filePath = `avatars/${fileName}`;

      // Eliminar archivo de Storage
      const { error: deleteError } = await supabase.storage
        .from("Cocoa-bucket")
        .remove([filePath]);

      if (deleteError) {
        throw deleteError;
      }

      // Actualizar metadata del usuario para remover avatar_url
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: null,
        },
      });

      if (updateError) {
        throw updateError;
      }

      toast.success("Imagen de perfil eliminada");
      return true;
    } catch (error: any) {
      console.error("Error deleting avatar:", error);
      toast.error(error.message || "Error al eliminar la imagen");
      return false;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadAvatar,
    deleteAvatar,
    uploading,
  };
}

