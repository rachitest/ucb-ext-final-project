<script lang="ts">
    export let progress: number;
</script>

<div class="progress-bar">
    <div class="progress" style="width: {progress}%;"></div>
</div>

<style lang="scss">
    .progress-bar {
        height: 8px;
        background-color: var(--progress-background);
        border-radius: 4px;
        overflow: hidden;

        .progress {
            height: 100%;
            background-color: var(--success-color);
            transition: width 0.3s ease;
        }
    }
</style>
