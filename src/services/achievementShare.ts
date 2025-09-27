interface UserAchievement {
  username: string;
  level: string;
  points: number;
  co2Saved: number;
  tripsCompleted: number;
  badgesEarned: number;
}

interface ShareableAchievement {
  type: 'milestone' | 'badge' | 'level' | 'co2';
  title: string;
  description: string;
  value: string;
  icon: string;
}

class AchievementShareService {
  
  /**
   * Generate achievement image canvas
   */
  private generateAchievementCanvas(achievement: ShareableAchievement, user: UserAchievement): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Set canvas size for Instagram post (1080x1080)
    canvas.width = 1080;
    canvas.height = 1080;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    gradient.addColorStop(0, '#10B981'); // Green
    gradient.addColorStop(1, '#3B82F6'); // Blue
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);
    
    // GreenPath logo area
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🌱 GreenPath', 540, 100);
    
    // Achievement icon/emoji
    ctx.font = '120px Arial';
    ctx.fillText(achievement.icon, 540, 300);
    
    // Achievement title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(achievement.title, 540, 420);
    
    // Achievement value
    ctx.font = 'bold 96px Arial';
    ctx.fillStyle = '#FEF3C7'; // Light yellow
    ctx.fillText(achievement.value, 540, 550);
    
    // Achievement description
    ctx.font = '36px Arial';
    ctx.fillStyle = '#F3F4F6';
    ctx.fillText(achievement.description, 540, 620);
    
    // User info
    ctx.font = 'bold 42px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`@${user.username}`, 540, 750);
    
    // Stats line
    ctx.font = '32px Arial';
    ctx.fillStyle = '#E5E7EB';
    const statsText = `${user.points} pts • ${user.co2Saved}kg CO₂ saved • ${user.badgesEarned} badges`;
    ctx.fillText(statsText, 540, 820);
    
    // Call to action
    ctx.font = '28px Arial';
    ctx.fillStyle = '#D1FAE5';
    ctx.fillText('Join the green travel revolution!', 540, 920);
    
    // Website
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('#GreenPath #EcoTravel', 540, 980);
    
    return canvas;
  }
  
  /**
   * Convert canvas to blob for sharing
   */
  private canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png', 0.9);
    });
  }
  
  /**
   * Get shareable achievements based on user data
   */
  getShareableAchievements(user: UserAchievement): ShareableAchievement[] {
    const achievements: ShareableAchievement[] = [];
    
    // CO2 Milestone
    if (user.co2Saved >= 100) {
      achievements.push({
        type: 'co2',
        title: 'Climate Hero!',
        description: `Saved ${user.co2Saved}kg of CO₂`,
        value: `${user.co2Saved}kg`,
        icon: '🌍'
      });
    }
    
    // Points Milestone
    if (user.points >= 1000) {
      achievements.push({
        type: 'milestone',
        title: 'Point Master!',
        description: 'Crushing the green goals',
        value: `${user.points} pts`,
        icon: '🏆'
      });
    }
    
    // Trip Milestone
    if (user.tripsCompleted >= 10) {
      achievements.push({
        type: 'milestone',
        title: 'Eco Explorer!',
        description: `Completed ${user.tripsCompleted} green trips`,
        value: `${user.tripsCompleted} trips`,
        icon: '🚴‍♂️'
      });
    }
    
    // Badge Achievement
    if (user.badgesEarned >= 3) {
      achievements.push({
        type: 'badge',
        title: 'Badge Collector!',
        description: 'Unlocking achievements',
        value: `${user.badgesEarned} badges`,
        icon: '🎖️'
      });
    }
    
    // Level Achievement
    achievements.push({
      type: 'level',
      title: user.level,
      description: 'Making a difference!',
      value: `Level ${user.level}`,
      icon: '⭐'
    });
    
    return achievements;
  }
  
  /**
   * Share achievement on Instagram (Web Share API or download)
   */
  async shareAchievement(achievement: ShareableAchievement, user: UserAchievement): Promise<void> {
    try {
      // Generate achievement image
      const canvas = this.generateAchievementCanvas(achievement, user);
      const blob = await this.canvasToBlob(canvas);
      
      // Create file for sharing
      const file = new File([blob], `greenpath-achievement-${Date.now()}.png`, {
        type: 'image/png'
      });
      
      // Try Web Share API first (mobile browsers)
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${achievement.title} - GreenPath`,
          text: `Just achieved ${achievement.title} on GreenPath! ${achievement.description} #GreenPath #EcoTravel`,
          files: [file]
        });
      } else {
        // Fallback: Download the image
        this.downloadImage(canvas, `greenpath-${achievement.type}-achievement.png`);
        
        // Show instructions for manual sharing
        this.showSharingInstructions(achievement);
      }
    } catch (error) {
      console.error('Error sharing achievement:', error);
      throw new Error('Failed to share achievement');
    }
  }
  
  /**
   * Download image for manual sharing
   */
  private downloadImage(canvas: HTMLCanvasElement, filename: string): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  /**
   * Show sharing instructions modal/alert
   */
  private showSharingInstructions(achievement: ShareableAchievement): void {
    const message = `
Achievement image downloaded! 

To share on Instagram:
1. Open Instagram app
2. Create new post
3. Select the downloaded image
4. Add caption: "Just achieved ${achievement.title} on GreenPath! ${achievement.description} #GreenPath #EcoTravel"
5. Share your achievement!
    `.trim();
    
    alert(message);
  }
  
  /**
   * Generate Instagram story-ready content
   */
  async shareToInstagramStory(achievement: ShareableAchievement, user: UserAchievement): Promise<void> {
    try {
      // Create story-sized canvas (1080x1920)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = 1080;
      canvas.height = 1920;
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
      gradient.addColorStop(0, '#10B981');
      gradient.addColorStop(1, '#3B82F6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1920);
      
      // Content centered for story
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 64px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🌱 GreenPath', 540, 200);
      
      ctx.font = '150px Arial';
      ctx.fillText(achievement.icon, 540, 500);
      
      ctx.font = 'bold 84px Arial';
      ctx.fillText(achievement.title, 540, 650);
      
      ctx.font = 'bold 120px Arial';
      ctx.fillStyle = '#FEF3C7';
      ctx.fillText(achievement.value, 540, 800);
      
      ctx.font = '48px Arial';
      ctx.fillStyle = '#F3F4F6';
      ctx.fillText(achievement.description, 540, 900);
      
      ctx.font = 'bold 54px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`@${user.username}`, 540, 1100);
      
      ctx.font = '36px Arial';
      ctx.fillStyle = '#E5E7EB';
      ctx.fillText('#GreenPath #EcoTravel', 540, 1300);
      
      // Download story image
      this.downloadImage(canvas, `greenpath-story-${achievement.type}.png`);
      
      // Show story sharing instructions
      alert(`
Story image downloaded!

To share on Instagram Story:
1. Open Instagram app
2. Swipe to create a story
3. Select the downloaded image
4. Add text, stickers, or tags as desired
5. Share to your story!
      `.trim());
      
    } catch (error) {
      console.error('Error creating story:', error);
      throw new Error('Failed to create story');
    }
  }
}

export default new AchievementShareService();
export type { UserAchievement, ShareableAchievement };