import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';
import { PostService } from 'src/app/shared/post.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  todayDate: Number = Date.now();
  currUser = {
    email: '',
    id: '',
    name: ''
  }

  topPosts = [];

  constructor(private authService: AuthService, private postService: PostService, private router: Router) { }

  ngOnInit(): void {
    this.authService.getCurrUser().subscribe((res: any) => {
      this.currUser = res;
    });

    this.postService.getTopTips().subscribe((res: []) => {
      this.topPosts = res;
    });
  }

  onEdit(id) {
    this.router.navigate(['/edit-tip'], { queryParams: { id: id}});
  }

  onDelete(id) {
    this.postService.deletePost(id).subscribe((res: any) => {
      if(res.success) {
        let index = this.topPosts.findIndex((post => post._id === id));
        this.topPosts.splice(index, 1);
      }
    });
  }

  like(id) {
    this.postService.likePost(id).subscribe((res: any) => {
      if(res.success) {
        let post: any = this.topPosts.filter((post => post._id === id))[0];
        post.likedUsers.push(this.currUser.id);
        post.likeCount++;
      }
    })
  }

  dislike(id) {
    this.postService.dislikePost(id).subscribe((res: any) => {
      if(res.success) {
        let post: any = this.topPosts.filter((post => post._id === id))[0];
        let index = post.likedUsers.findIndex((_id) => _id === this.currUser.id);
        post.likedUsers.splice(index, 1);
        post.likeCount--;
      }
    })
  }

  

}
