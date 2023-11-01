import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "..";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PostForm({ post }) {
  const { register, handleSubmit, watch, setValue, control, getValues } =
    useForm({
      defaultValues: {
        title: post?.title || "",
        slug: post?.$id || "",
        content: post?.content || "",
        status: post?.status || "active",
      },
    });

  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  console.log("1 userData", userData);

  const submit = async (data) => {
    if (post) {
      const file = data.image[0]
        ? await appwriteService.uploadFile(data.image[0])
        : null;

      if (file) {
        appwriteService.deleteFile(post.featuredImage);
      }

      const dbPost = await appwriteService.updatePost(post.$id, {
        ...data,
        featuredImage: file ? file.$id : undefined,
      });

      if (dbPost) {
        navigate(`/post/${dbPost.$id}`);
      }
    } else {
      const file = await appwriteService.uploadFile(data.image[0]);

      if (file) {
        const fileId = file.$id;
        data.featuredImage = fileId;
        const dbPost = await appwriteService.createPost({
          ...data,
          userId: userData.$id,
        });

        if (dbPost) {
          navigate(`/post/${dbPost.$id}`);
        }
      }
    }
  };

  const slugTransform = useCallback((value) => {
    if (value && typeof value === "string")
      return value
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z\d\s]+/g, "-")
        .replace(/\s/g, "-");

    return "";
  }, []);

  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        setValue("slug", slugTransform(value.title), { shouldValidate: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, slugTransform, setValue]);

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
      <div className="w-2/3 px-2">
        <Input
          label="Title :"
          placeholder="Title"
          className="mb-4"
          {...register("title", { required: true })}
        />
        <Input
          label="Slug :"
          placeholder="Slug"
          className="mb-4"
          {...register("slug", { required: true })}
          onInput={(e) => {
            setValue("slug", slugTransform(e.currentTarget.value), {
              shouldValidate: true,
            });
          }}
        />
        <RTE
          label="Content :"
          name="content"
          control={control}
          defaultValue={getValues("content")}
        />
      </div>
      <div className="w-1/3 px-2">
        <Input
          label="Featured Image :"
          type="file"
          className="mb-4"
          accept="image/png, image/jpg, image/jpeg, image/gif"
          {...register("image", { required: !post })}
        />
        {post && (
          <div className="w-full mb-4">
            <img
              src={appwriteService.getFilePreview(post.featuredImage)}
              alt={post.title}
              className="rounded-lg"
            />
          </div>
        )}
        <Select
          options={["active", "inactive"]}
          label="Status"
          className="mb-4"
          {...register("status", { required: true })}
        />
        <Button
          type="submit"
          bgColor={post ? "bg-green-500" : undefined}
          className="w-full"
        >
          {post ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
}

// import conf from "../conf/conf.js";
// import { Client, ID, Databases, Storage, Query } from "appwrite";

// export class Service {
//   client = new Client();
//   databases;
//   bucket;

//   constructor() {
//     this.client
//       .setEndpoint(conf.appwriteUrl)
//       .setProject(conf.appwriteProjectId);
//     this.databases = new Databases(this.client);
//     this.bucket = new Storage(this.client);
//   }

//   async createPost({ title, slug, content, featuredImage, status, userId }) {
//     try {
//       return await this.databases.createDocument(
//         conf.appwriteDatabaseId,
//         conf.appwriteCollectionId,
//         slug,
//         {
//           title,
//           content,
//           featuredImage,
//           status,
//           userId,
//         }
//       );
//     } catch (error) {
//       console.log("Appwrite sevice :: createPost :: error", error);
//     }
//   }

//   async updatePost(slug, { title, content, featuredImage, status }) {
//     try {
//       return await this.databases.updateDocument(
//         conf.appwriteDatabaseId,
//         conf.appwriteCollectionId,
//         slug,
//         {
//           title,
//           content,
//           featuredImage,
//           status,
//         }
//       );
//     } catch (error) {
//       console.log("Appwrite sevice :: updatePost :: error", error);
//     }
//   }

//   async deletePost(slug) {
//     try {
//       await this.databases.deleteDocument(
//         conf.appwriteDatabaseId,
//         conf.appwriteCollectionId,
//         slug
//       );
//       return true;
//     } catch (error) {
//       console.log("Appwrite service :: deletePost :: error", error);
//       return false;
//     }
//   }

//   async getPost(slug) {
//     try {
//       return await this.databases.getDocument(
//         conf.appwriteDatabaseId,
//         conf.appwriteCollectionId,
//         slug
//       );
//     } catch (error) {
//       console.log("Appwrite service :: getPost :: error", error);
//       return false;
//     }
//   }

//   // you can use queries only if you have created indexes in appwrite
//   async getPosts(queries = [Query.equal("status", "active")]) {
//     try {
//       return await this.databases.listDocuments(
//         conf.appwriteDatabaseId,
//         conf.appwriteCollectionId,
//         queries
//       );
//     } catch (error) {
//       console.log("Appwrite service :: getPosts :: error", error);
//       return false;
//     }
//   }

//   // file upload service
//   async uploadFile(file) {
//     try {
//       return await this.bucket.createFile(
//         conf.appwriteBucketId,
//         ID.unique(),
//         file
//       );
//     } catch (error) {
//       console.log("Appwrite service :: uploadFile :: error", error);
//       return false;
//     }
//   }

//   async deleteFile(fileId) {
//     try {
//       await this.bucket.deleteFile(conf.appwriteBucketId, fileId);
//     } catch (error) {
//       console.log("Appwrite service :: deleteFile :: error", error);
//       return false;
//     }
//   }

//   getFilePreview(fileId) {
//     return this.bucket.getFilePreview(conf.appwriteBucketId, fileId);
//   }
// }

// const sevice = new Service();
// export default sevice;
