package net.SPIS.backend.DTO;

public class TagViewCountDTO {
    private Integer tagId;
    private String tagName;
    private Long totalViews;

     
    public TagViewCountDTO(Integer tagId, String tagName, Long totalViews) {
        this.tagId = tagId;
        this.tagName = tagName;
        this.totalViews = totalViews;
    }

     
    public Integer getTagId() {
        return tagId;
    }

    public String getTagName() {
        return tagName;
    }

    public Long getTotalViews() {
        return totalViews;
    }

     
    public void setTagId(Integer tagId) {
        this.tagId = tagId;
    }

    public void setTagName(String tagName) {
        this.tagName = tagName;
    }

    public void setTotalViews(Long totalViews) {
        this.totalViews = totalViews;
    }
}