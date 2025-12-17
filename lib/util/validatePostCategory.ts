import { supabase } from "@components/lib/supabaseClient";
import { lowerURL } from "./lowerURL";

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * 카테고리와 게시물 ID의 유효성을 검증합니다.
 * @param categoryParam - URL의 카테고리 파라미터
 * @param postId - 게시물 ID
 * @returns 검증 결과 객체
 */
export async function validatePostCategory(
  categoryParam: string,
  postId: string
): Promise<ValidationResult> {
  try {
    console.log("검증 시작:", { categoryParam, postId });

    const decodedCategory = decodeURIComponent(categoryParam);
    const normalizedUrlCategory = lowerURL(decodedCategory);

    console.log("정규화된 카테고리:", normalizedUrlCategory);

    // 1차 검증: 카테고리 존재 여부 확인
    const { data: categories, error: categoryError } = await supabase
      .from("categories")
      .select("id, name");

    console.log("카테고리 조회:", { categories, categoryError });

    if (categoryError) {
      console.log("카테고리 조회 실패");
      return { isValid: false, error: "카테고리 조회 실패" };
    }

    const matchedCategory = categories?.find(
      (cat) => lowerURL(cat.name) === normalizedUrlCategory
    );

    console.log("매칭된 카테고리:", matchedCategory);

    if (!matchedCategory) {
      console.log("존재하지 않는 카테고리");
      return { isValid: false, error: "존재하지 않는 카테고리" };
    }

    // 2차 검증: 해당 카테고리에 게시물 ID가 존재하는지 확인
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, category_id")
      .eq("id", postId)
      .single();

    console.log("게시물 조회:", { post, postError });

    if (postError || !post) {
      console.log("게시물을 찾을 수 없음");
      return { isValid: false, error: "게시물을 찾을 수 없음" };
    }

    // 게시물의 카테고리 ID와 URL 카테고리의 ID가 일치하는지 확인
    console.log("카테고리 ID 비교:", {
      postCategoryId: post.category_id,
      matchedCategoryId: matchedCategory.id,
    });

    if (post.category_id !== matchedCategory.id) {
      console.log("카테고리 불일치");
      return {
        isValid: false,
        error: "카테고리 불일치",
      };
    }

    console.log("검증 성공");
    return { isValid: true };
  } catch (error) {
    console.error("검증 중 오류 발생:", error);
    return { isValid: false, error: "검증 중 오류 발생" };
  }
}
